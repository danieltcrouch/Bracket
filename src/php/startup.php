<?php
session_start();

$project    = "bracket";
$siteTitle  = "Bracket";
$pageTitle  = "The Bracket";
$image      = "https://bracket.religionandstory.com/images/*.jpg"; //todo
$description= "..."; //todo
$keywords   = "..."; //todo
$homeUrl    = "https://bracket.religionandstory.com";

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
}

function getHelpImage()
{
    echo "https://religionandstory.com/common/images/question-mark.png";
}

function getConstructionImage()
{
    echo "https://image.freepik.com/free-icon/traffic-cone-signal-tool-for-traffic_318-62079.jpg";
}

?>