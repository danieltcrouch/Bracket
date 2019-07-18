<?php

function getAllLogos( $onlyIncludeActive = false )
{
    global $image;

    echo "[ {
        title: \"Marvel Bracket\",
        image: \"https://img.cinemablend.com/filter:scale/cb/8/7/6/f/0/7/a876f07fdc693995a2d33e0252a297ba68c7e7c21b556aa99f2f31b66fd1adb0b.jpg?mw=600\",
        help:  \"Vote for characters based on how cool they are.\",
        id:     \"Marvel\",
        active: true
    }, {
        title:     \"Your Bracket\",
        image:     \"$image\",
        help:      \"Additional instructions will appear here.\",
        id:        \"Thing\",
        active:    true
    }, {
        title:     \"Your Bracket\",
        image:     \"$image\",
        help:      \"Additional instructions will appear here.\",
        id:        \"Thing2\",
        active:    true
    }, {
        title:     \"Your Bracket\",
        image:     \"$image\",
        help:      \"Additional instructions will appear here.\",
        id:        \"Thing3\",
        active:    false
    }, {
        title:     \"Your Bracket\",
        image:     \"$image\",
        help:      \"Additional instructions will appear here.\",
        id:        \"Thing4\",
        active:    false
    } ]";
}

?>