#
# Env script to be sourced in a bash shell to setup PATHs properly
# Copyright 2014 Cyan Inc. All rights reserved.
#

# Source the base environment from the beaker
source node_modules/beaker/files/base_env.sh

# Put any project specific environment stuff here

# Environment variables needed to build cairo, a dependency of webdrivercss
if [ `uname` = 'Darwin' ]; then  # 'Darwin' is OS X
    PKG_CONFIG_PATH=/usr/local/lib/pkgconfig:/opt/X11/lib/pkgconfig
else
    PKG_CONFIG_PATH=/usr/lib/pkgconfig
fi
