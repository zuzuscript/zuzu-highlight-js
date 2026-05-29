BUILD_DATE ?= $(shell date +%Y%m%d)
PACKAGE_NAME = zuzu-highlight-js-$(BUILD_DATE)
ZIP_FILE = $(PACKAGE_NAME).zip
STAGING_DIR = .dist-build

.PHONY: all dist clean

all: dist

dist: $(ZIP_FILE)

$(ZIP_FILE): README.md CHANGELOG.md zuzu-highlight.js
	rm -rf $(STAGING_DIR)
	mkdir -p $(STAGING_DIR)/$(PACKAGE_NAME)
	cp README.md CHANGELOG.md zuzu-highlight.js $(STAGING_DIR)/$(PACKAGE_NAME)/
	rm -f $(ZIP_FILE)
	cd $(STAGING_DIR) && zip -q -r ../$(ZIP_FILE) $(PACKAGE_NAME)
	rm -rf $(STAGING_DIR)

clean:
	rm -rf $(STAGING_DIR) zuzu-highlight-js-*.zip
