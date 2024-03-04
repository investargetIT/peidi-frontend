#!/bin/bash

docker run -it --rm \
-v $(pwd):/app \
-v /app/node_modules \
-p 3000:3000 \
peidi-frontend
