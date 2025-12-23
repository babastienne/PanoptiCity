---
title: Advanced configuration
parent: Installation and configuration
nav_order: 2
---

# Advanced configuration




## Updating the project after modifications

If you ave modified any configuration file, you'll need to rebuild the project for the modifications to be taken into consideration. To do so you need to run :

```bash
make stop   # Only if your instance was up and running
make build  # Will recreate the buld of the backend application
make start  # Retard the application
```
