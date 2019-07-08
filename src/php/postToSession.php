<?php
session_start();

if ( array_key_exists('data', $_POST) ) {
    if ( array_key_exists('timestamp', $_POST) ) {
        $_SESSION['data'] = $_POST['data'];
        Header("Content-Type: application/json;charset=UTF-8");
        die( json_encode( array('status' => 'OK') ) );
    }
    die("Error");
}

$_POST = $_SESSION['data'];
unset( $_SESSION['data'] );
?>