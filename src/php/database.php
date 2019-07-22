<?php

//todo - clean up meta vs logo

function getAllMetas()
{
    $mysqli = getMySQL();

    $metas = [];
    $result = $mysqli->query( "SELECT
            id,
            date,
            (CASE WHEN active = 0 THEN '' ELSE active END) as \"active\",
            name AS \"title\",
            image,
            info AS \"help\"
        FROM meta
        ORDER BY name DESC " );
    if ( $result && $result->num_rows > 0 ) {
        while ( $row = $result->fetch_array() ) {
            array_push($metas, $row);
        }
    }

    return $metas;
}

function getBracketInfo( $bracketId )
{
    $mysqli = getMySQL();

    $bracketInfo = null;
    $result = $mysqli->query( "SELECT
            m.id, m.active, m.name, m.image, m.info as \"help\", m.mode,
            t.start_time, t.frequency, t.frequency_point, t.end_point,
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
        WHERE m.name = '$bracketId' " );
    $mysqli->close();

    if ( $result ) {
        $row = $result->fetch_array();
        $bracketInfo = [
            'logo' => [
                'active' => $row['active'],
                'title'  => $row['title'],
                'image'  => $row['image'],
                'help'   => $row['help']
            ],
            'bracket' => [
                'active'  => $row['active'],
                'mode'    => $row['mode'],
                'winners' => $row['winners'],
                'endTime' => [
                    'lastEnd'        => $row['start_time'],
                    'frequency'      => $row['frequency'],
                    'frequencyPoint' => $row['frequencyPoint'],
                    'closeTime'      => $row['end_point']
                ],
                'entries' => []
            ]
        ];

        $entryTitles = explode( '|', $row['e_names'] ); //todo - "titles" should be "names" everywhere
        $entryImages = explode( '|', $row['e_images'] );
        foreach( $entryTitles as $index => $title ) {
            array_push( $bracketInfo['entries'], ['title' => $title, 'image' => $entryImages[$index]] );
        }
    }

    return $bracketInfo;
}

function saveBracket( $logo, $bracket )
{
    $mysqli = getMySQL();

    $bracketId = getGUID();
    $logo = json_decode( $logo );
    $bracket = json_decode( $bracket );

    $freq       = $bracket->endTime->frequency      ? ( "'" . $bracket->endTime->frequency      . "'" ) : "NULL";
    $freqPoint  = $bracket->endTime->frequencyPoint ? ( "'" . $bracket->endTime->frequencyPoint . "'" ) : "NULL";
    $closeTime  = $bracket->endTime->closeTime      ? ( "'" . $bracket->endTime->closeTime      . "'" ) : "NULL";

    $insertMeta     = "INSERT INTO meta (id, name, image, info, mode) 
        VALUES ('$bracketId', '" . cleanse( $logo->title ) . "', '$logo->image', '" . cleanse( $logo->help ) . "', '$bracket->mode')";
    $insertTiming   = "INSERT INTO timing (bracket_id, active, start_time, frequency, frequency_point, end_point)
        VALUES ('$bracketId', 0, NULL, $freq, $freqPoint, $closeTime)";
    $insertEntries  = "INSERT INTO entries (bracket_id, id, name, image, seed) VALUES ";
    for ( $i = 0; $i < count( $bracket->entries ); $i++ )
    {
        if ( $i != 0 )
        {
            $insertEntries .= ", ";
        }

        $entryId = getGUID();
        $name = $bracket->entries[$i]->title;
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

function cleanse( $value )
{
    return $value;
}

function getMySQL() //todo - use best php/mysql practices - bind variables
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

    if ( isset($_POST['logo']) && isset($_POST['bracket']) ) {
        $result = $action( $_POST['logo'], $_POST['bracket'] );
    }
    elseif ( false ) {
        //
    }
    else {
        $result = $action();
    }

    echo json_encode($result);
}

