---
title: Contributing
nav_order: 6
---

# Contributing to PanoptiCity

First off, thank you for considering contributing to PanoptiCity! It’s people like you that help reveal the scale of mass surveillance and provide the community with better transparency tools.

There are many ways to contribute, from adding data to the map to refining the simulation engine.

---

## 🚀 How Can I Help?

### 🗺️ Data contribution

**Less than 5% of the cameras in the world exists into OSM. One major way to help is to map them!**

PanoptiCity is powered by **OpenStreetMap (OSM)**. The most effective way to improve the map is to add surveillance cameras directly to the OSM database.

* **Identify:** Look for cameras in your neighborhood.
* Create new objects for missing cameras.
* Add technical details like `direction`, `type`, `height`, `angle` and `surveillance:type` for cameras where it is missing.
* **Tools:** Use the built-in "Add Camera" tool in PanoptiCity or apps like [StreetComplete](https://github.com/streetcomplete/StreetComplete) or [Every Door](https://every-door.app/).

### 🌐 Translations (i18n)

**Help us translate the UI into more languages (currently supporting English and French).**

We want PanoptiCity to be available to everyone.
* Our translations live in `src/js/translations.js`.
* **Add a language:** If you speak a language not yet supported, feel free to copy an existing language object and translate the keys. We can provide help if needed.

You can override translations of the front-end interface or add new languages by editing the file `front-end/translations.js`. By default the project is translated in english and french. To add a new language you need to duplicate the english object, change it's language code (for example put `es` for Spanish) and then translate the entries.

> Panopticity does not support the translations for countries variations (e.g `fr-CA` for Canadian french ; `en-US` for american english ; etc.). It only support main language translations. Any contribution to improve this behavior is welcome.

By default PanoptiCity check the language configuration of the use browser to determine the language to display. It does not allow the user to switch the language interface directly. If you wish to improve this feel free to contribute.


### 🎨 UX/UI Design

If you have ideas on how to improve the visual aspect, the navigation or any UX related subject feel free to discuss them in an issue, we're looking for some advices to improve it.

### 📃 Documentation

Our "user manual" documentation is built into the app's modals for better SEO and user discovery.

The technical documentation is hosted on Github pages.

Feel free to improve one or the other if you have ideas. Any new feature or contribution should be documented.

### 📳 Frontend development

We use **Vanilla JavaScript (ES Modules)** and **PicoCSS**. We avoid big frameworks to keep the project lightweight and accessible.
Any help is welcome if you want to refactor the code or add new features.

### ⚙ Backend & data processing

The backend is built with **Python/Django** and **PostGIS**.
* **Simulation engine:** Improve the FOV (Field of View) calculation logic.
* **API:** Optimize the tile generation and data pruning scripts.
* **Stat analysis:** Help us refine the "Scenarios" by analyzing the technical specs of modern CCTV models.

### ✨ Features

A lot of cool features can still be implemented in this project and you're welcome to help if you're interested. Check the issues or open one if you want to discuss ideas.

### 📈 Tests

The project is not tested currently. Every modification or feature need to be manually tested before being validated. If you want to add a test structure, any help is welcome (E2E, unit test, etc.).

---

## 🛠️ Development workflow

### Reporting a bug
*   Check the [issues](https://github.com/babastienne/panopticity/issues) tab to see if the bug has already been reported.
*   If not, open a new issue. Include:
    *   A clear, descriptive title.
    *   Steps to reproduce the bug.
    *   Your browser and device information.

### Submitting a feature request
*   We love new ideas! Please open an issue and describe:
    *   What problem does this feature solve?
    *   How should it work from a user's perspective?

### Pull requests (PR)
1.  **Fork** the repository and create your branch from `main`.
2.  **Coding style:**
    *   Keep it simple. Stick to Vanilla JS and CSS Variables.
    *   Comment your code, especially for complex mathematical logic.
3.  **Commit messages:** Use clear, concise messages (e.g., `feat: add new ATM icon`, `fix: sidebar toggle on mobile`).
4.  **Submit:** Open a PR and describe the changes you've made.

---

## 📜 Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. We are a community of mappers, activists, and developers working for the public good.

## ⚖️ License

By contributing, you agree that your contributions will be licensed under the project's [License](./LICENSE).

---

**Questions?** Feel free to open an issue or reach out via the GitHub repository.
