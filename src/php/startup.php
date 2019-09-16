<?php
session_start();

$project     = "bracket";
$siteTitle   = "Bracket";
$pageTitle   = "The Bracket";
$image       = "https://bracket.religionandstory.com/images/chess.jpg";
$description = "Create brackets to solve super serious questions and debates. With dynamic graphics, there can only be one winner.";
$keywords    = "bracket,two,four,eight,sixteen,thirty-two,competition,tournament,decide,dynamic";
$homeUrl     = "https://bracket.religionandstory.com";

function getRootPath()
{
    $public = "public_html";
    $path = $_SERVER['DOCUMENT_ROOT'];
    $length = strpos( $path, $public ) + strlen( $public );
    return substr( $path, 0, $length ) . "/";
}

function getSubPath()
{
    return getRootPath() . "bracket/";
}

function includeHeadInfo()
{
    global $siteTitle;
    global $pageTitle;
    global $image;
    global $description;
    global $keywords;
    include(getRootPath() . "common/html/head.php");
}

function includeHeader()
{
    global $homeUrl;
    include(getRootPath() . "common/html/header.php");
}

function includeModals()
{
    include(getRootPath() . "common/html/modal.html");
    include(getRootPath() . "common/html/modal-binary.html");
    include(getRootPath() . "common/html/modal-prompt.html");
    include(getRootPath() . "common/html/modal-prompt-big.html");
    include(getRootPath() . "common/html/toaster.html");
    include(getRootPath() . "common/html/date-picker.html");
}

function getHelpImage()
{
    echo "https://religionandstory.com/common/images/question-mark.png";
}

function getLeftArrowImage()
{
    echo "https://religionandstory.com/common/images/left.png";
}

function getRightArrowImage()
{
    echo "https://religionandstory.com/common/images/right.png";
}

function getConstructionImage()
{
    echo "https://image.freepik.com/free-icon/traffic-cone-signal-tool-for-traffic_318-62079.jpg";
}

?>