#!/usr/bin/env bash

project_folder=${PWD##*/}

target=pi@raspberrypi:${project_folder}

rm -rf out
rsync -avr --delete --exclude .git --exclude .idea --exclude '*.ts' --exclude config --exclude deploy.sh . out/

rsync -avr --delete out ${target}: