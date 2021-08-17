#!/bin/bash

set -e

START_FOLDER="$(pwd)"
SCRIPT_FOLDER=`dirname "$0"`

cd "${SCRIPT_FOLDER}"
SCRIPT_FOLDER="$(pwd)"
cd "${START_FOLDER}"

ROOT_FOLDER="$(pwd)"
while [ ! -f "${ROOT_FOLDER}/antora.yml" ]; do
	if [ "${ROOT_FOLDER}" = "/" ]; then
		echo "ERROR: Could not find antora.yml in any of the parent folders."
		exit 1
	fi
	cd ..
	ROOT_FOLDER="$(pwd)"
done

if [ ! -d "modules/ROOT" ]; then
	echo "ERROR: Could not find modules/ROOT relative to antora.yml"
	exit 2
fi

if [ -f book.cfg ]; then
	. book.cfg
fi

OUTPUT_FILENAME=${OUTPUT_FILENAME:-book.pdf}
ROOT_FOLDER="${ROOT_FOLDER}/modules/ROOT"
docker run --rm -it \
	-v ${ROOT_FOLDER}:/documents/ \
	-v ${SCRIPT_FOLDER}:/theme/ \
	asciidoctor/docker-asciidoctor \
	asciidoctor-pdf \
		-a icons=font \
		-a imagesdir=./assets/images \
		-a revdate=`date +%Y-%m-%d` \
		-a pdf-theme="/theme/book-theme.yml" \
		book.adoc
mv "${ROOT_FOLDER}/book.pdf" "${START_FOLDER}/${OUTPUT_FILENAME}"

echo "Book successfully built in ${START_FOLDER}/${OUTPUT_FILENAME}"

