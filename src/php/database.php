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
        title:     \"DC Bracket\",
        image:     \"https://nerdist.com/wp-content/uploads/2018/05/maxresdefault-1.jpg\",
        help:      \"Vote for the most iconic.\",
        id:        \"DC\",
        active:    true
    }, {
        title:     \"Your Bracket\",
        image:     \"https://www.fleetowner.com/sites/fleetowner.com/files/styles/article_featured_standard/public/uncle-sam-i-want-you.png?itok=pw0imgck\",
        help:      \"Additional instructions will appear here.\",
        id:        \"previewBracket\",
        active:    true
    }, {
        title:     \"Political Poll\",
        image:     \"https://www.washingtonpost.com/resizer/1dHHVlrrcQBgN2IyYj1uPDkq_bA=/1484x0/arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/2UBQVEWXVRFCDJDNPHT4DPSMFM\",
        help:      \"Vote on who would make the best leader of the free world.\",
        id:        \"politicsRule\",
        active:    false
    }, {
        title:     \"This is broke...\",
        image:     \"https://www.torbenrick.eu/blog/wp-content/uploads/2017/03/Broken-windows-theory-Applied-to-organizational-culture.jpg\",
        help:      \"Screw off.\",
        id:        \"NULL\",
        active:    false
    } ]";
}

?>