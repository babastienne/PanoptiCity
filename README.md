<h1 align="center">PanoptiCity</h1>

<p align="center"><bold>A life under surveillance</bold></p>

<p align="center"><img alt="PanoptiCity logo" src="front-end/android-chrome-192x192.png"></p>

<p align="center">
  <a href="https://panopticity.fr/">
    <img src="https://img.shields.io/badge/Visit_the_website-orange?style=for-the-badge" alt="Visit the website">
  </a>
  <a href="https://babastienne.github.io/PanoptiCity/">
    <img src="https://img.shields.io/badge/View_the_documentation-blue?style=for-the-badge" alt="View the documentation">
  </a>
</p>

## Introduction

Welcome to PanoptiCity !

This project's purpose is to help display information about CCTV, cameras, to easily map where they are, what they can see, and get data about their usage in cities. The website also give users an easy way to contribute into the OpenStreetMap database if they want to add cameras when they see some that are not already known or improve the attributes of existing ones.

PanoptiCity is my way to act and try to raise awareness about mass surveillance in all cities, to make people realize the amount of cameras around us that they usually not even see. In a time were artifical intelligence is generalizing, it is more than ever the moment to ask ourselves, is it really the model of society we want to build collectively ?

**To learn more about the core ideas behind PanoptiCity, see our [complete manifesto](https://babastienne.github.io/PanoptiCity/manifest).**

### Screenshots

| ![Home page](docs/images/home.png)                        | ![Details view](docs/images/camera-details.png)           |
| --------------------------------------------------------- | --------------------------------------------------------- |
| ![Creation camera type](docs/images/camera-add-mount.png) | ![Limits of camera vision](docs/images/camera-limits.png) |

### Supported features

- Get data from OpenStreetMap database
- Compute field of vision of each camera, take in consideration surounding buildings
- Mutliple models for field of vision computation, based on an analysis of the technical features of available cameras on the cctv market. Possiblity to switch between models.
- Connection with OpenStreetMap account
- Edition of existing cameras
- Creation form to contribute new cameras
- Dark/light mode

To discover all the features, go to [panopticity.fr](https://panopticity.fr/) !

## Documentation

The complete technical documentation is available directly on [https://babastienne.github.io/PanoptiCity/](https://babastienne.github.io/PanoptiCity/). It covers:

- Installation
- Configuration
- Architecture
- Performances
- Development 
- Contributions


# :warning: **All sections below are being progressively moves to the documentation website** :warning:

### Development

Pretty much the same as in production. If you want to contribute to this project there is some contribution ideas available on [todo.md](./todo.md). Don't hesitate to ask if you want to share ideas or need help to start.

## Configuration

### Translations

You can override translations of the front-end interface or add new languages by editing the file `front-end/translations.js`. By default the project is translated in english and french. To add a new language you need to duplicate the english object, change it's language code (for example put `es` for Spanish) and then translate the entries.

> Panopticity does not support the translations for countries variations (e.g `fr-CA` for Canadian french ; `en-US` for american english ; etc.). It only support main language translations. Any contribution to improve this behavior is welcome.

By default PanoptiCity check the language configuration of the use browser to determine the language to display. It does not allow the user to switch the language interface directly. If you wish to improve this feel free to contribute.

### Burger Menu

The latteral menu allow to display static content to give users some information about any subject.

By default PanoptiCity suggests some contents but you can override them to remove or add any entry. To do so, in the file `front-end/translations.js`, you'll need to edit the values under the `menuContent` object. Each sub-entry corresponds to an item to the menu. The key is the title of the content and the value is the body of the page. The value can contains HTML formated text. To simplify the formating it is also possible to use `\n` to split paragraphs.

## Calculation methods for field of view

### What is the field of view

The field of view is the area visible/covered by a CCTV. the field of view of every camera depends on a lot of variables. The most important are :

- The height of the camera
- The direction in which the camera is pointed
- The angle (tilt) of the camera that indicated if it is pointed toward the horizon or the floor
- The [resolution](https://en.wikipedia.org/wiki/Image_resolution) of the lens of the camera. This gives the number of pixels (e.g: 1920x1080 ~= 2MP ; 2556x1440 ~= 4MP ; 3840x2160 ~= 8MP ; etc.).
- The [focal lens](https://en.wikipedia.org/wiki/Camera_lens#Aperture_and_focal_length) of the lens. This mainly impact the angle of view and allow some cameras to be wide-angle (low focal) or on the opposite to focus on specific details (high focal). The focal is expressed in mm (e.g: 8mm ; 12mm ; 75mm).
- The [sensor format](https://en.wikipedia.org/wiki/Image_sensor_format) which is the ratio that indicates the size of the image (usually expressed as 1/2.5" ; 2/3" ; etc.).

The combination of those last 3 parameters allow to determine the quality of an image for a specific distance. The quality is expressed in PPM (pixels per meters) representing the pixel density. For example for a camera of 1920x1080 resolution with a 25mm lens and a 1/3" format, the quality of the image of a person standing 10 meters away from the camera will be 998ppm.

By taking those elements in consideration, we can compute the field of view of camera in which a person can be identified, recognized, detected. We use this matching table to establish what quality corresponds to what level :

| Color on map                                             | Level of surveillance                                                                                                                                                                                                            | Image quality    | Example                                                                             |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------- |
| ![Circle red](docs/images/icons/zone-identification.svg) | **Identification**: At this level a person can easily be identified by any human or automated program.                                                                                                                           | **> 250 PPM**    | 320ppm image ![320ppm image of a cyclist](docs/images/resolution/example320ppm.jpg) |
| ![Circle red](docs/images/icons/zone-recognition.svg)    | **Recognition**: Some specific details can be seen. Sometimes not enough details to automatize the recognition but a targeted person can still be recognized by a human eye. This quality level can be used for forensic review. | **250 - 65 PPM** | 160ppm image ![160ppm image of a cyclist](docs/images/resolution/example160ppm.jpg) |
| ![Circle red](docs/images/icons/zone-observation.svg)    | **Observation**: It is possible to detect persons, objects and movements but not to identify details. Usually for large non targeted observation.                                                                                | **25 - 65 PPM**  | 40ppm image ![40ppm image of a cyclist](docs/images/resolution/example40ppm.jpg)    |
|                                                          | **Not usable**: At this level we consider the camera unable to detect anything and do not display any field of view anymore.                                                                                                     | **< 25 PPM**     | 20ppm image ![40ppm image of a cyclist](docs/images/resolution/example20ppm.jpg)    |

> The level of surveillance and corresponding qualities are inspired from this [Department of Homeland Security document about VideoSurveillance Quality](https://www.dhs.gov/sites/default/files/publications/VQiPS_Digital-Video-Quality-HB_UPDATED-180117-508.pdf).

It is important to note that a lot of modern cameras have the ability to zoom and move. We talk about dome or PTZ cameras (Pan-Tilt-Zoom). It means that for a lot of devices the variables (particularly the focal) can change depending if the camera is zoomed or not. Public cameras can generally alternate between wide angle and zoomed views depending on the operator or detection algorythm behind.

### The lack of data in OpenStreetMap

Obvisouly for each camera the information about resolution, focal and sensor format are not in the OpenStreetMap database. First because it would be a pain to contribute but mainly because it is not possible to get this information even when on field.

The other variables (height, angle and direction) are more easy to declare in OpenStreetMap. Panopticity encourage users to declare the height of a camera every time as well as the direction and the angle when it's a fixed or panning camera.

**If sometimes there is no data, how can we determine what are the values that should be used in Panopticity then ?**

For basic information, we use default values if they are not tagged in OSM. If they are presents we use them. Default values are:

| Field     | Default Value                                                                              |
| --------- | ------------------------------------------------------------------------------------------ |
| Height    | 5 meters                                                                                   |
| Angle     | 15°                                                                                        |
| Direction | No default value. If a fixed camera does not have direction, no field of view is displayed |

For the other fields, to make an estimation, we compiled in a file the technnical information of more than 15200 models of CCTV cameras from 143 differents brands. This gave us a global view of the current technical level of the CCTV market as it is in 2025. Keep in mind that new camera models are released every week so depending when you read this lines the numbers can be differents today.

The numbers used can be seen in the `docs/AllCameraList.ods` file (or in JSON format in `docs/camerasList.json`).

With those numbers, we sorted every variable and were able to determine statistics about quality of cameras. Depending of the camera type (fixed or dome/PTZ cameras), we created three models to help us determine the quality of cameras (and therefore their field of view):

| Scenario            | Description                                                                                                                                                                                           | Values for Fixed Cameras           | Dome/PTZ Cameras                    |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ----------------------------------- |
| Best Case Scenario  | This is the scenario corresponding to the first decile which means that 90% of cameras on the market have better quality that what is displayed on map as the field of view                           | 2.8mm focal & 1920x1080 resolution | 2.8mm focal & 1280x1024 resolution  |
| Mean / Average      | The default scenario. There are as many cameras with better quality than the displayed field of view as there are with poorer quality                                                                 | 6.8mm focal & 2556x1440 resolution | 6.5mm focal & 2556x1440 resolution  |
| Worst Case Scenario | This is the scenario corresponding to the last decile, which means that the displayed field of view on map is like if all cameras were in the top 10% of the market (in terms of technical abilities) | 26mm focal & 3840x2160 resolution  | 68.2mm focal & 3840x2160 resolution |

The models numbers choosen are the result of a statistic analysis made for the cameras technical information compiled. More information about these analysis below.

**How it could be improved**

One good way to improve this models would be to create a correlation between every camera model and their sales numbers to ponderate the weight of each camera in the model computation. However thoses numbers can't be easily found.

### Angle of vision for fixed cameras

For fixed cameras, we decided to use an angle for the width of view of 85°. Once again this angle depends a lot of the camera used and espacially its type (fisheye cameras for example, bullet cameras, etc.). Why 85° ? Our calculations showed that the average focal for fixed cameras in the best scenario (= first decile) is 2.8mm. From far the mains format of lenses are 1/3" and 1/2.7" (which corresponds respectively to 4.8mm and 5.37mm). With thoses informations we can estimate the angle of view of the majority of cameras:

- Angle of view (in radian) = 2 \* ArcTan(Camera format in mm / 2 \* Camera focal in mm)
- Conversion of radian in degrees: Degree = Radian \* 180 / Pi

The results are:

- For 1/3" lenses: 81.2°
- for 1/2.7" lenses: 87.5°

Therefore, to simplify we choose to use for all directed cameras an angle of view of ~85°.

### Tilt angle for fixed cameras

While dome and PTZ cameras can usually change their tilt angle, it is not the case for fixed cameras. Therefore this data should be taken in consideration when computing the field of view of fixed cameras.

At the moment the tilt angle is used to apply a computing coefficient. We consider the angle <= 17° being the same as 0° to compensate the vertical angle of vision that is at least 35° and because when aiming for a subject at the same level as the camera we tend to tilt it by 17°.

This behavior can be improved to stop applying a coefficient and compute the real limit of field of view based on the camera height.

### Statistic analysis of technical data from cameras dataset

As mentionned above, the technical information of more than 15 000 cameras as been compiled into a dataset to have a global view of the technical abilities of the equipement sold on the market. The data as been used to determine the three models used to compute field of view of cameras.

The dataset is available for consultation on this repository.

The following sections compile some graphical analysis that display trends of repartition for multiple technical features (resolution, minimum focal, maximum focal, average focal and format) depending of cameras category (fixed or dome/ptz).

#### Limits of the dataset

Some specific cameras as been removed from dataset analysis, especially thermal or industrial cameras. Some camera type has been kept but affect the results.

For exemple bullets or fisheyes cameras has been kept and categorized as Dome cameras. However, those cameras has a very short focal and are not really of the same type as "classical" dome or PTZ cameras that can have very large focal. This is a know limitation and the models could be improved by a better categorization or a ponderation with a weight for each sub-type determined by the statistical repartition analysis based on real world observations.

#### Format lense repartition

![Format lens repartition (linear)](docs/images/stats/data-format.png)

![Format lens repartition (logarithmic scale)](docs/images/stats/data-format-log.png)

#### Resolution repartition

![Resolution repartition for any camera type](docs/images/stats/data-resolution.png)

#### Focals repartition

Those numbers are the minimum/average/maximum focal available for each camera product. Some cameras only have one focal so each numbers will be the same. But some others can zoom and change their focal therefore these categorization has been made.

##### Minimum focal

**Fixed cameras**

![Minimum focal repartition for fixed cameras (linear)](docs/images/stats/data-min-focal-fixed.png)

![Minimum focal repartition for fixed cameras (logarithmic scale)](docs/images/stats/data-min-focal-fixed-log.png)

**Dome/PTZ cameras**

![Minimum focal repartition for dome/PTZ cameras (linear)](docs/images/stats/data-min-focal-domeptz.png)

![Minimum focal repartition for dome/PTZ cameras (logarithmic scale)](docs/images/stats/data-min-focal-domeptz-log.png)

##### Average focal

**Fixed cameras**

![Average focal repartition for fixed cameras (linear)](docs/images/stats/data-average-focal-fixed.png)

![Average focal repartition for fixed cameras (logarithmic scale)](docs/images/stats/data-average-focal-fixed-log.png)

**Dome/PTZ cameras**

![Average focal repartition for dome/PTZ cameras (linear)](docs/images/stats/data-average-focal-domeptz.png)

![Average focal repartition for dome/PTZ cameras (logarithmic scale)](docs/images/stats/data-average-focal-domeptz-log.png)

##### Maximum focal

**Fixed cameras**

![Maximum focal repartition for fixed cameras (linear)](docs/images/stats/data-max-focal-fixed.png)

![Maximum focal repartition for fixed cameras (logarithmic scale)](docs/images/stats/data-max-focal-fixed-log.png)

**Dome/PTZ cameras**

![Maximum focal repartition for dome/PTZ cameras (linear)](docs/images/stats/data-max-focal-domeptz.png)

![Maximum focal repartition for dome/PTZ cameras (logarithmic scale)](docs/images/stats/datas-max-focal-domeptz-log.png)

## More information

Wow, you're still there ? I guess you're really interested in this project. Here is some usefull information and resources.

### Create or tag multiple cameras on same location

If you see multiple cameras at the same location (for example on the same pole), it is advised to create one entry for each camera and set the location the closest as possible. This way it will ensure the logic "one node in OSM = one object in real life".

This way of representing objects has been discussed in the community and seems to be the recommanded way:

- See [this discussion](https://community.openstreetmap.org/t/how-to-tag-multiple-cameras-on-one-supporting-pole/2070) (in english)
- Or [almost the same](https://forum.openstreetmap.fr/t/marquer-plusieurs-cameras-sur-un-meme-mat/13427) (in french)
