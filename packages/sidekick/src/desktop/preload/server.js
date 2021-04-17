const net = require('net');
const ndjson = require('ndjson');
const pMinDelay = require('p-min-delay');
const pTimeout = require('p-timeout'); /* do not update to p-timeout 5.x; it requires ESM modules */

/**
 * Closes a TCP socket gracefully.
 */
function closeGracefully(socket, timeout = 3000) {
  return pTimeout(
    new Promise((resolve) => {
      socket.on('close', resolve);
      socket.destroy();
    }),
    timeout,
    /* fallback = */ () => {
      console.warn('Timeout while trying to close connection');
    }
  );
}

/**
 * Creates a TCP socket connection to the dedicated Sidekick port of a
 * Skybrush server and returns a promise that resolves with a proxy object to
 * the parsed ND-JSON stream on the socket when the connection is established.
 */
function createServerConnection({
  host,
  port,
  timeout = 10000,
  minDelay = 500,
}) {
  const socket = new net.Socket();
  const promise = new Promise((resolve, reject) => {
    socket.on('error', reject);
    socket.connect(port, host, () => {
      try {
        const stream = socket.pipe(ndjson.parse());

        // We close the connection to the server after some seconds of inactivity.
        // Server is supposed to send keepalive packets (newlines) every 5
        // seconds.
        socket.setTimeout(timeout, async () => {
          stream.end();
          await closeGracefully(socket);
        });

        // We need to return a proxy object to the stream because the stream itself
        // cannot pass the context boundary between the preload script and the
        // main web page
        resolve({
          close: () => closeGracefully(socket),
          off: (event, ...args) => stream.off(event, ...args),
          on: (event, ...args) => stream.on(event, ...args),
        });

        // We also need to close the stream if the socket emits an error
        socket.on('error', () => {
          stream.end();
        });
      } catch (error) {
        reject(error);
      } finally {
        socket.off('error', reject);
      }
    });
  });

  /* Add a timeout around the promise so we don't wait for the connection
   * indefinitely */
  const promiseWithTimeout = pTimeout(promise, timeout, () => {
    socket.destroy();
    throw new Error('Timeout while connecting to server');
  });

  /* Ensure that the promise takes at least some time to avoid a confusing flash
   * on the UI */
  return minDelay > 0
    ? pMinDelay(promiseWithTimeout, minDelay)
    : promiseWithTimeout;
}

module.exports = createServerConnection;
