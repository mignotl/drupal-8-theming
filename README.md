# Drupal 8 Theming
This is a documentation on how to create a theme in Drupal 8.
## Create the theme
A new theme should be placed in `web/themes/custom`with this architecture:
```
mytheme/
  css/
  images/
  js/
  templates/
  mytheme.info.yml
  mytheme.libraries.yml
  mytheme.theme
```

Notes:
* Replace **mytheme** with the name of your theme, it's usually the name of your project.
* There is **custom** in the folder path, it's for the themes that are written by yourself. There is also **contrib** which is for the theme that has been downloaded, for example you can place a base theme inside contrib.

### mytheme.info.yml
This file provides the meta-data about the theme. Drupal is searching for this file in priority when searching for new themes.

Detailed example:
```yml
name: My Theme
type: theme
description: 'My fabulous theme'
package: Custom
version: 0.1.0
core: 8.x                   # The version of the Drupal Core
base theme: false           # If you want your theme to extend a base theme
screenshot: screenshot.png  # Screenshot of the theme that appears in the page of theme selection

# Libraries, see next part
libraries:
  - mytheme/global-styling
  - mytheme/global-scripts

# Remove a CSS file when using a base theme
stylesheets-remove:
  - '@bartik/css/style.css'                              # With a token linking to the theme
  - core/assets/vendor/jquery.ui/themes/base/dialog.CSS  # Or with a direct link to avoid conflicts

# Files to be included for CKEditor in admin pages
ckeditor_stylesheets:
  - assets/css/style.css

# Regions (are written in the template: layout/page.html.twig)
regions:
  header: Header
  content: Content   # Required
  aside: Aside
  footer: Footer

# Remove regions when using a base theme
regions_hidden:
  - sidebar_first
```
More informations [here](https://www.drupal.org/docs/8/theming-drupal-8/defining-a-theme-with-an-infoyml-file).
### mytheme.libraries.yml
See [next part](#libraries).

### mytheme.theme
This is where preprocess functions are written. Usage example [here](https://www.drupal.org/docs/8/theming-drupal-8/modifying-attributes-in-a-theme-file).


## Libraries
Libraries are used to add CSS or JS assets to the page.

They are defined in `mytheme.libraries.yml`. Libraries can be overridden, external files or in dependence of others.

### Basic structure
```yml
my-library:
  version: 0.1.0
  css:
    theme:  # (optional) SMACSS file separation, can be base, layout, component, state or theme
      css/style.css: {}
  js:
    js/script.js
  dependencies:  # Other libraries than are needed for my-library. Format: theme-name/library-name
    - mytheme/other-library: {}
```
Notes:
* More informations about SMACSS in the [next part](#smacss).
* Dependencies are really useful for the javascript, see [this part](#dependencies).
* Insert options such as 'minified: true' or 'type: external' inside {}, see [the documentation](https://www.drupal.org/docs/8/theming/adding-stylesheets-css-and-javascript-js-to-a-drupal-8-theme#libraries-options-details) for the full list.

### Global libraries
Global libraries are imported on every page thanks to their declaration in the `mytheme.info.yml` file (see [precedent part](#mythemeinfoyml)). The convention for their names is to add `global-` before their name, example:
```yml
global-styling:
  version: VERSION
  css:
    theme:
      css/style.css: {}

global-scripts:
  version: VERSION
  js:
    js/script.js: {}
  dependencies:
    - core/jquery
    - core/jquery.once
    - core/drupalSettings
```

### Not global libraries
There are global libraries that needs to be included on every page of the site, but you can also add libraries only on certain conditions:

To include a library only on some pages / blocks, use the available hooks in the `mytheme.theme` file:
```js
function mytheme_preprocess_node(&$variables) {
  $variables['#attached']['library'][] = 'mytheme/my-library';
}
```
To include a library in a specific twig file, add: 
```js
{{ attach_library('mytheme/my-library') }}
```
### External libraries
Example of external library:
```yml
angular.angularjs:
  remote: https://github.com/angular/angular.js
  version: 1.4.4
  license:
    name: MIT
    url: https://github.com/angular/angular.js/blob/master/LICENSE
    gpl-compatible: true
  js:
    https://ajax.googleapis.com/ajax/libs/angularjs/1.4.4/angular.min.js: { type: external, minified: true }
```
To use the same protocol as the site, simply replace `https://` or `http://` by `//`.

### Override a library
This functionality is barely use since we never use base themes but here you go:
```yml
libraries-override:
  # Replace an entire library.
  core/drupal.collapse: mytheme/collapse
  
  # Replace an asset with another.
  subtheme/library:
    css:
      theme:
        css/layout.css: css/my-layout.css

  # Replace an override asset from stable:
  contextual/drupal.contextual-toolbar:
    css:
      component:
        /core/themes/stable/css/contextual/contextual.toolbar.css: css/contextual.toolbar.css

  # Replace a core module JavaScript asset.
  toolbar/toolbar:
    js:
      js/views/BodyVisualView.js: js/views/BodyVisualView.js

  # Remove an asset.
  drupal/dialog:
    css:
      theme:
        dialog.theme.css: false
  
  # Remove an entire library.
  core/modernizr: false
```
More informations [here](https://www.drupal.org/docs/8/theming/adding-stylesheets-css-and-javascript-js-to-a-drupal-8-theme).


## Styles
Drupal uses SMACSS & BEM but this is not required for writing a theme.

### SMACSS
Drupal follows the SMACSS categorization way to organize CSS files:

* **Base** — CSS reset/normalize plus HTML element styling.
* **Layout** — macro arrangement of a web page, including any grid systems.
* **Component** — discrete, reusable UI elements.
* **State** — styles that deal with client-side changes to components.
* **Theme** — purely visual styling (“look-and-feel”) for a component.

More informations [here](https://www.drupal.org/node/1887918#separate-concerns).

### BEM
BEM (Block Element Modifier) is a naming convention for the Drupal classes:

* **Block** — The outermost parent element of the component is defined as the block.
* **Element** — Inside of the component may be one or more children called elements.
* **Modifier** — Either a block or element may have a variation signified by a modifier.

If all three are used in a name it would look something like this:
`[block]__[element]--[modifier]`


## Scripts

### Javascript template file
The scripts in Drupal 8 use **behaviors**. All behaviors are called on on page load and on every request such as Ajax requests.
```js
/**
 * @file
 * Provides some feature.
 *
 * The extra line between the end of the @file docblock
 * and the file-closure is important.
 */
(function ($, Drupal, DrupalSettings) {
    "use strict";

    /**
     * Attaches [...] behavior to [...].
     *
     * Namespace should be unique.
     * context is the part of the page that change, on a page load, this will be the document.
     * settings is where the informations from the PHP are thanks to DrupalSettings.
     *
     * @type {Drupal~behavior}
     *
     * @prop {Drupal~behaviorAttach} attach
     *   Specific description of this attach function goes here.
     * @prop {Drupal~behaviorDetach} detach
     *   Specific description of this detach function goes here.
     */
    Drupal.behaviors.namespace = {
        // Variables
        value: '.mon-texte',

        // Executed on page load and every request, including Ajax requests.
        attach: function (context, settings) {
            // Add context so this will succeed only if this part has changed.
            // Once allow this code to run only once.
            $('main', context).once('namespace').each(() => {
                // ...
                this.myFunction();
            });
        },
        // Used to detach registered behaviors from a page element.
        detach: function (context, settings, trigger) {
            // The trigger is a string containing the causing of the behavior to be detached.
            if (trigger === 'unload') {
                // (default) Context element is being removed from the DOM.
            } else if(trigger === 'move') {
                // Element is about to be moved within the DOM.
                // Example: tabledrag row swap.
            } else if(trigger === 'serialize') {
                // Called when an Ajax form is submitted with the form as the context.
            }
        },
        myFunction() {
            // Useful functions.
        }
    };
})(jQuery, Drupal, DrupalSettings);
```
### Dependencies
As you can see, on the global file closure we include jQuery, Drupal and DrupalSettings. To use them they needs to be added in the dependencies of the library like so:
```yml
my-library:
  version: VERSION
  js:
    js/script.js: {}
  dependencies:
    - core/jquery
    - core/jquery.once    # A jQuery plugin allowing to only apply a function once to an element.
    - core/drupal         # We need core/drupal in order to take advantage of the Drupal.behaviors.
    - core/drupalSettings
```
To get a complete overview of all the core libraries, take a look inside `core/core.libraries.yml`.

### Pass variables from PHP
DrupalSettings allows to pass variables from PHP to Javascript. For example I want to pass to my-library the number variable equals to 6:
```php
$variables['#attached']['drupalSettings']['mytheme']['myLibrary']['number'] = 6;
```
And in the Javascript:
```js
console.log(drupalSettings.number); // print 6
```

## Templates
Templates provides HTML markup and some presentation logic.

To organize the templates in a clear way, it is strongly recommended to follow the Classy theme folder structure. It can be found in the core in `web/core/themes/classy/templates`.

Templates don't usually need to be overridden, it is recommended to use the "manage display" from each content for grouping fields and adding classes. This has the advantage to be editable on production. For example, if a field needs to be moved or removed, this can be done without any code deployment. This flexibility must be kept in mind when writing the style.

If any file need to be overridden, try to override high level templates such as `content/node.html.twig` or `field/field.html.twig` or be as specific as possible to avoid big impact.


## Automation tools
When developing a theme in Drupal 8, the best tool is **gulpjs**. No need to use library manager because Drupal already do it. You can find an example of [gulpfile](gulpfile.js) and [package.json](package.json) in this git or create one with the help of the [Drupal documentation](https://www.drupal.org/docs/8/theming/creating-automation-tools-for-custom-themes-gulpjs).

When using preprocessing tools, the tree folder can change to this:
```
mytheme/
  assets/
    css/
    js/
  sources/
    scss/
    js/
  images/
  templates/
  mytheme.info.yml
  mytheme.libraries.yml
  mytheme.theme
```
Don't forget to change the libraries path.

## Side notes
* When editing the theme config files (*.theme, *.info.yml, *.libraries.yml) or adding new templates, the cache should be rebuild to see the changes (by using drush cr for example).
* To activate the theme, go to the appearance page in the admin menu.
* This is just a summary of everything you need to know to make a Drupal 8 theme. This was created with the [official documentation](https://www.drupal.org/docs/8) and with different online sources such as [sqndr theming guide](https://sqndr.github.io/d8-theming-guide/index.html).
