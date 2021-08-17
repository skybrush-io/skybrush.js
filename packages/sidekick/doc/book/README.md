Skybrush AsciiDoctor PDF theme
==============================

Usage
-----

1. Assuming that `antora.yml` is in the `doc/` subdoler, create the book
   outline in `doc/modules/ROOT/book.adoc`.

2. Embed this module as a submodule in another repo in the `doc/` subfolder.
   (Adjust the folder path appropriately if `antora.yml` is elsewhere).

3. Run the `build.sh` script from `doc/`.


To change the name of the PDF file being built, create a file named `book.cfg`
next to `antora.yml` and add `OUTPUT_FILENAME=something.pdf` in it.

