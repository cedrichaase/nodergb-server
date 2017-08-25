#!/usr/bin/env bash

HOST=192.168.178.2

project_folder=${PWD##*/}

target=pi@${HOST}:${project_folder}

rm -rf out
rsync -avr --delete --exclude .git --exclude .idea --exclude '*.ts' --exclude config --exclude deploy.sh --exclude out . out/

rsync -avr --delete out/* ${target}
