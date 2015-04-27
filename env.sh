#
# Env script to be sourced in a bash shell to setup PATHs properly
# Copyright 2015 . All rights reserved.
#

# Source the base environment from the toolkit
source node_modules/beaker/files/base_env.sh

# Environment variables needed to build cairo, a dependency of webdrivercss
if [ `uname` = 'Darwin' ]; then  # OS X
    PKG_CONFIG_PATH=/opt/X11/lib/pkgconfig:/usr/local/lib/pkgconfig
else  # Better be Ubuntu
    PKG_CONFIG_PATH=/usr/lib/pkgconfig
fi

# Put any project specific environment stuff here
