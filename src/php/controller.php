<?php
require_once( "service.php" );
require_once( "database.php" );

if ( isset($_POST['action']) && function_exists( $_POST['action'] ) ) {
    $action = $_POST['action'];
    $result = null;

    try {
        //updateVotingSession (SERVICE)
        if ( isset($_POST['id']) && isset($_POST['state']) && isset($_POST['time']) && isset($_POST['activeId']) && isset($_POST['winners']) ) {
            $result = $action( $_POST['id'], $_POST['state'], $_POST['time'], $_POST['activeId'], $_POST['winners'] );
        }
        //startSurvey (SERVICE)
        elseif ( isset($_POST['id']) && isset($_POST['activeId']) && isset($_POST['time']) ) {
            $result = $action( $_POST['id'], $_POST['activeId'], $_POST['time'] );
        }
        //setSurveyState
        elseif ( isset($_POST['id']) && isset($_POST['state']) ) {
            $result = $action( $_POST['id'], $_POST['state'] );
        }
        //setCloseTime
        elseif ( isset($_POST['id']) && isset($_POST['time']) ) {
            $result = $action( $_POST['id'], $_POST['time'] );
        }
        //vote (SERVICE)
        elseif ( isset($_POST['id']) && isset($_POST['votes']) ) {
            $result = $action( $_POST['id'], $_POST['votes'] );
        }
        //createSurvey, updateSurvey (SERVICE)
        elseif ( isset($_POST['survey']) ) {
            $result = $action( $_POST['survey'] );
        }
        //getSurvey, getSurveyMeta, getCurrentVotes
        elseif ( isset($_POST['id']) ) {
            $result = $action( $_POST['id'] );
        }
        //getAllSurveyMetas
        else {
            $result = $action();
        }

        echo json_encode($result);
    }
    catch ( PDOException $e ) {
        echo "Error: " . $e->getMessage();
    }
}

?>