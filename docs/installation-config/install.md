---
title: Installation
parent: Installation and configuration
nav_order: 1
---

# Install PanoptiCity
{: .no_toc }


## Table of contents
{: .no_toc .text-delta }

- TOC
{:toc}

---

To run this project, a complete automated script has been created. The goal of the script it to facilitate the installation as much as possible (from creating the database to installing the SSL certificates)

Follow this guide to install PanoptiCity on your own server.

{: .note }
The installation procedure has been developed, tested and reproduced for GNU/Linux environments. It has been deployed on Ubuntu / Debian. Because it is working with docker, it should work on MacOS and Windows but it has not been tested yet.


{: .warning }
This is the installation procedure to follow if you want to install the project in production. If you want to use it in development mode, follow the [development installation procedure]({{site.baseurl}}/technical/dev-install)


## Pre-requisites

### Install Docker

To run this application you'll need docker.

If not done already, [install docker](https://docs.docker.com/engine/install/) on the machine.

### Configure domains

To run the project you'll need a domain name. Configure you DNS to create at two domains :

- The first one will be used for the public website (e.g: panopticity.fr)
- The second one will be for the backend api (e.g: api.panopticity.fr)

Both of the domains should point to the server IP address.

### Download the project source code

Download this project : `git clone https://github.com/babastienne/panopticity`

Go to the downloaded folder : `cd panopticity`

## Download your data

To import data to your project, you need to download file corresponding to the area you want to cover. This file will be used to import cameras as well as buildings (needed to compute the field of view of each camera).

{: .note }
By default this project come with sample data so you can follow the import procedure without having to download any file (usefull if you just want to test the project). The data is named `sample-data.osm.pbf`. If you want to use it, you can skip this section and go directly to [Installation](#installation)

In OpenStreetMap, there is multiple ways of keeping informations up to date. This project choose to import data from [PBF files](https://wiki.openstreetmap.org/wiki/PBF_Format). 

To keep change of the updates we use [diff files](https://wiki.openstreetmap.org/wiki/Planet.osm/diffs) that are generated regularly. It can by : daily / hourly / minutely.

Depending on the frequency of updates you want and the area you wish to cover, you'll need to choose where to download your data file. Few suggestions :

- [https://planet.openstreetmap.org/](https://planet.openstreetmap.org/) : Official source with possiblity to keep change daily / hourly / minutely. It is only for the entire planet therefore the file size can be important and the database for buldings may not be able to keep up without good resources.
- [https://download.openstreetmap.fr/](https://download.openstreetmap.fr/) : Daily extracts and minutely diffs. Files are splits into continents / countries / states. Very usefull to download specific region and keep up with the changes almost in real time.

You can find an up to date list of mirrors on the [OpenStreetMap dedicated wiki page](https://wiki.openstreetmap.org/wiki/Planet.osm) to explore more options. If you want to keep your data up to date you'll need to find one that handle diffs.

**Download your desired pbf and put it in the `osm-data` folder located in the panopticity project.**

You are now ready to install the project ! 😇

## Installation

PanoptiCity is using a Makefile to facilitate some operations (dropping database, launching the project, installation, etc.).

**To install the project you just need to run `make install`**.

The command will call the `install.sh` script and the complete procedure is automatized.

The script will start by asking multiple questions (database name, secrets, domain names, etc.) : this is used to create an environment file and set your variables. The majority of the variables can be keep with their default values. For the secrets variables, the script auto-generate random passwords. 

You still need to set **at least** those variables (and can keep default values for the others) :
- `FRONTEND_DOMAIN_NAME` > Domain name configured for your public website
- `BACKEND_DOMAIN_NAME` > Domain name configured for your api
- `CERTBOT_EMAIL` > You email address used for certbot certificates renewal (warning: fake emails will be detected)
- `CLIENT_ID_OSM_APP` > The ID of you OSM app to allow users to contribute to OSM

The script will finally ask you for the name of the file to read data from. You'll need to enter the exact name of the `pbf-file` you've dowloaded in the previous step. You need to enter only the name, not the path of the file. If you want to use sample data, you can enter `sample-data.osm.pbf`.

The script will then proceed to install everything including the SSL certificates and the nginx server configuration.


{: .warning }
Depending of the size of your data to import and the machine used, the installation can be quite long (from couple minutes to couple hours). To learn more about performances, see [Import procedure and performances]({{site.baseurl}}/technical/Import-and-performances).


At the end of the installation, the script set everything to be ready for both :
- Running in production
- Auto-update the database

## Launching the website

To launch the website, run `make start`.

Visit your website domain name and you should see PanoptiCity running ! 🎉

_____________

Now that you've installed the site, you are ready for the next steps :
- [Advanced configuration]({{site.baseurl}}/installation-config/configuration)
- [Updating the data]({{site.baseurl}}/installation-config/update)
