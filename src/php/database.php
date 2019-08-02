<?php

function getBracket( $bracketId )
{
    $mysqli = getMySQL();

    $bracketInfo = null;
    $result = $mysqli->query( "SELECT
            m.id, m.state, m.title, m.image, m.help, m.mode,
            t.frequency, t.frequency_point, t.scheduled_close,
            r.top_wins,
            e_names,
            e_images
        FROM meta m
            JOIN timing t ON m.id = t.bracket_id
            LEFT OUTER JOIN results r ON m.id = r.bracket_id
            LEFT OUTER JOIN (
                SELECT
                    e.bracket_id,
                    GROUP_CONCAT(e.name ORDER BY e.seed ASC SEPARATOR '|') as \"e_names\",
                    GROUP_CONCAT(e.image ORDER BY e.seed ASC SEPARATOR '|') as \"e_images\"
                FROM entries e
                GROUP BY e.bracket_id
            ) ent ON m.id = ent.bracket_id
        WHERE m.id = '$bracketId' " );
    $mysqli->close();

    if ( $result ) {
        $row = $result->fetch_array();
        $bracketInfo = [
            'state'   => $row['state'],
            'title'   => $row['title'],
            'image'   => $row['image'],
            'help'    => $row['help'],
            'mode'    => $row['mode'],
            'winners' => $row['winners'],
            'timing' => [
                'frequency'      => $row['frequency'],
                'frequencyPoint' => $row['frequency_point'],
                'scheduledClose' => $row['scheduled_close']
            ],
            'entries' => []
        ];

        $entryNames = explode( '|', $row['e_names'] );
        $entryImages = explode( '|', $row['e_images'] );
        foreach( $entryNames as $index => $name ) {
            array_push( $bracketInfo['entries'], ['name' => $name, 'image' => $entryImages[$index]] );
        }
    }

    return $bracketInfo;
}

function createBracket( $bracket )
{
    $mysqli = getMySQL();

    $bracketId = getGUID();
    $bracket = json_decode( $bracket );

    $frequency      = $bracket->timing->frequency      ? ( "'" . $bracket->timing->frequency      . "'" ) : "NULL";
    $frequencyPoint = $bracket->timing->frequencyPoint ? ( "'" . $bracket->timing->frequencyPoint . "'" ) : "NULL";
    $scheduledClose = $bracket->timing->scheduledClose ? ( "'" . $bracket->timing->scheduledClose . "'" ) : "NULL";
    $frequencyPoint = $bracket->timing->frequencyPoint === "0" ? "'0'" : $frequencyPoint;

    $insertMeta     = "INSERT INTO meta (id, state, title, image, help, mode) 
        VALUES ('$bracketId', 'ready', '" . cleanse( $bracket->title ) . "', '$bracket->image', '" . cleanse( $bracket->help ) . "', '$bracket->mode')";
    $insertTiming   = "INSERT INTO timing (bracket_id, frequency, frequency_point, scheduled_close)
        VALUES ('$bracketId', $frequency, $frequencyPoint, $scheduledClose)";
    $insertEntries  = "INSERT INTO entries (bracket_id, id, name, image, seed) VALUES ";
    for ( $i = 0; $i < count( $bracket->entries ); $i++ )
    {
        if ( $i != 0 )
        {
            $insertEntries .= ", ";
        }

        $entryId = getGUID();
        $name = $bracket->entries[$i]->name;
        $image = $bracket->entries[$i]->image;
        $insertEntries .= "('$bracketId', '$entryId', '" . cleanse( $name ) . "', '$image', $i)";
    }

    $query = $insertMeta . "; " .
        $insertTiming . "; " .
        $insertEntries;

	$mysqli->multi_query($query);
	$mysqli->close();

    return $bracketId;
}

function updateBracket( $bracket )
{
    $mysqli = getMySQL();

    $bracket = json_decode( $bracket );
    $bracketId = $bracket->id;

    $frequency      = $bracket->timing->frequency      ? ( "'" . $bracket->timing->frequency      . "'" ) : "NULL";
    $frequencyPoint = $bracket->timing->frequencyPoint ? ( "'" . $bracket->timing->frequencyPoint . "'" ) : "NULL";
    $scheduledClose = $bracket->timing->scheduledClose ? ( "'" . $bracket->timing->scheduledClose . "'" ) : "NULL";
    $frequencyPoint = $bracket->timing->frequencyPoint === "0" ? "'0'" : $frequencyPoint;

    $query = "UPDATE meta m, timing t
              SET m.help = '$bracket->help',
                  m.mode = '$bracket->mode',
                  t.frequency = $frequency,
                  t.frequency_point = $frequencyPoint,
                  t.scheduled_close = $scheduledClose 
              WHERE m.id = '$bracketId'
                AND t.bracket_id = '$bracketId' ";

	$mysqli->query($query);
	$mysqli->close();

    return updateEntries( $bracketId, $bracket->entries );
}

function updateEntries( $bracketId, $entries )
{
    $mysqli = getMySQL();

    $queryNameCase  = "CASE ";
    $queryImageCase = "CASE ";
    for ( $i = 0; $i < count( $entries ); $i++ )
    {
        $entry = $entries[$i];
        $queryNameCase  .= "WHEN seed = $entry->seed THEN '$entry->name' ";
        $queryImageCase .= "WHEN seed = $entry->seed THEN '$entry->image' ";
    }
    $queryNameCase  .= "END";
    $queryImageCase .= "END";

    $query     = "UPDATE entries
                  SET name = ($queryNameCase),
                      image = ($queryImageCase)
                  WHERE bracket_id = '$bracketId' ";

	$mysqli->query($query);
	$mysqli->close();

    return $bracketId;
}

function getAllBracketMetas()
{
    $mysqli = getMySQL();

    $logos = [];
    $result = $mysqli->query( "SELECT
            id,
            date,
            state,
            title,
            image,
            help,
            mode
        FROM meta
        WHERE state != 'hidden'
        ORDER BY title DESC " );
    if ( $result && $result->num_rows > 0 ) {
        while ( $row = $result->fetch_array() ) {
            array_push( $logos, $row );
        }
    }

    return $logos;
}

function getBracketMeta( $bracketId )
{
    $mysqli = getMySQL();

    $meta = null;
    $result = $mysqli->query( "SELECT title, image, help FROM meta WHERE id = '$bracketId' " );
    if ( $result->num_rows > 0 ) {
        $row = $result->fetch_array();
        $meta = [
            'title' => $row['title'],
            'image' => $row['image'],
            'help'  => $row['help']
        ];
    }

    return $meta;
}

function getBracketId( $title )
{
    $mysqli = getMySQL();

    $id = null;
    $result = $mysqli->query( "SELECT id FROM meta WHERE name = '$title' LIMIT 1 " );
    if ( $result->num_rows > 0 ) {
        $row = $result->fetch_array();
        $id = $row['id'];
    }

    return $id;
}

function getWinners( $bracketId )
{
    $mysqli = getMySQL();

    $winners = "";
    $result = $mysqli->query( "SELECT top_wins FROM results WHERE bracket_id = '$bracketId' " );
    if ( $result->num_rows > 0 ) {
        $row = $result->fetch_array();
        $winners = $row['top_wins'];
    }

    return $winners;
}

function isVotingAllowed( $bracketId )
{
    $mysqli = getMySQL();

    $isVotingAllowed = false;
    $result = $mysqli->query( "SELECT (CASE WHEN state = 'active' THEN '1' ELSE '' END) FROM meta WHERE id = '$bracketId' " );
    if ( $result->num_rows > 0 ) {
        $row = $result->fetch_array();
        $isVotingAllowed = $row['id'];
    }

    return $isVotingAllowed;
}

function setBracketState( $bracketId, $state )
{
    $mysqli = getMySQL();

    $query = "UPDATE meta SET state = '$state' WHERE id = '$bracketId' ";
	$mysqli->query($query);
	$mysqli->close();

    return true;
}

function setCloseTime( $bracketId, $closeTime )
{
    $mysqli = getMySQL();

    $query = "UPDATE timing SET scheduled_close = $closeTime WHERE bracket_id = '$bracketId' ";
	$mysqli->query($query);
	$mysqli->close();

    return true;
}

function startBracket( $bracketId, $closeTime )
{
    $mysqli = getMySQL();

    $query = "UPDATE meta m, timing t SET m.state = 'active', t.scheduled_close = $closeTime WHERE m.id = '$bracketId' AND t.bracket_id = '$bracketId' ";
	$mysqli->query($query);
	$mysqli->close();

    return true;
}

function cleanse( $value )
{
    return $value;
}

function getMySQL() //todo 3 - use best php/mysql practices - bind variables
{
    return new mysqli('localhost', 'religiv3_admin', '1corinthians3:9', 'religiv3_bracket');
}

function getGUID()
{
	mt_srand((double)microtime()*10000);
	return strtoupper(md5(uniqid(rand(), true)));
}

if ( isset($_POST['action']) && function_exists( $_POST['action'] ) ) {
    $action = $_POST['action'];
    $result = null;

    if ( isset($_POST['id']) && isset($_POST['state']) ) {
        $result = $action( $_POST['id'], $_POST['state'] );
    }
    elseif ( isset($_POST['id']) && isset($_POST['time']) ) {
        $result = $action( $_POST['id'], $_POST['time'] );
    }
    elseif ( isset($_POST['bracket']) ) {
        $result = $action( $_POST['bracket'] );
    }
    elseif ( isset($_POST['id']) ) {
        $result = $action( $_POST['id'] );
    }
    elseif ( isset($_POST['title']) ) {
        $result = $action( $_POST['title'] );
    }
    else {
        $result = $action();
    }

    echo json_encode($result);
}