<?php

function getBracket( $bracketId )
{
    $query = "SELECT
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
            WHERE m.id = :bracketId ";
    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':bracketId', $bracketId);
    $statement->execute();

    $result = $statement->fetch();
    $bracketInfo = [
        'state'   => $result['state'],
        'title'   => $result['title'],
        'image'   => $result['image'],
        'help'    => $result['help'],
        'mode'    => $result['mode'],
        'winners' => $result['winners'],
        'timing'  => [
            'frequency'      => $result['frequency'],
            'frequencyPoint' => $result['frequency_point'],
            'scheduledClose' => $result['scheduled_close']
        ],
        'entries' => []
    ];
    $entryNames  = explode( '|', $result['e_names'] );
    $entryImages = explode( '|', $result['e_images'] );
    foreach( $entryNames as $index => $name ) {
        array_push( $bracketInfo['entries'], ['name' => $name, 'image' => $entryImages[$index]] );
    }

    $connection = null;
    return $bracketInfo;
}

function createBracket( $bracket )
{
    $bracketId = getGUID();
    $bracket = json_decode( $bracket );
    $entries = $bracket->entries;
    $state = "active";

    $entryValues = "";
    for ( $i = 0; $i < count( $entries ); $i++ )
    {
        $entryValues .= ( $i != 0 ) ? ", " : "";
        $entryValues .= "(:bracketId, :entryId, :entryName$i, :entryImage$i, :entrySeed$i)";
    }
    $insertMeta = "INSERT INTO meta (id, state, title, image, help, mode) VALUES (:bracketId, :state, :title, :image, :help, :mode)";
    $insertTiming = "INSERT INTO timing (bracket_id, frequency, frequency_point, scheduled_close) VALUES (:bracketId, :frequency, :frequencyPoint, :scheduledClose)";
    $insertEntries = "INSERT INTO entries (bracket_id, id, name, image, seed) VALUES $entryValues";

    $query =
        "$insertMeta;\n
         $insertTiming;\n
         $insertEntries";

    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':bracketId',      $bracketId);
    $statement->bindParam(':state',          $state);
    $statement->bindParam(':title',          $bracket->title);
    $statement->bindParam(':image',          $bracket->image);
    $statement->bindParam(':help',           $bracket->help);
    $statement->bindParam(':mode',           $bracket->mode);
    $statement->bindParam(':frequency',      $bracket->frequency);
    $statement->bindParam(':frequencyPoint', $bracket->frequencyPoint);
    $statement->bindParam(':scheduledClose', $bracket->scheduledClose);
    for ( $i = 0; $i < count( $entries ); $i++ )
    {
        $entry = $entries[$i];
        $entryId = getGUID();
        $statement->bindParam(":entryId$i",    $entryId);
        $statement->bindParam(":entrySeed$i",  $entry->seed);
        $statement->bindParam(":entryName$i",  $entry->name);
        $statement->bindParam(":entryImage$i", $entry->image);
    }
    $statement->execute();

    $connection = null;
}

function updateBracket( $bracket )
{
    $bracket = json_decode( $bracket );
    $bracketId = $bracket->id;

    $query     = "UPDATE meta m, timing t
                  SET m.help = :help,
                      m.mode = :mode,
                      t.frequency = :frequency,
                      t.frequency_point = :frequencyPoint,
                      t.scheduled_close = :scheduledClose 
                  WHERE m.id = :bracketId
                    AND t.bracket_id = :bracketId ";

    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':help',           $bracket->help);
    $statement->bindParam(':mode',           $bracket->mode);
    $statement->bindParam(':frequency',      $bracket->frequency);
    $statement->bindParam(':frequencyPoint', $bracket->frequencyPoint);
    $statement->bindParam(':scheduledClose', $bracket->scheduledClose);
    $statement->bindParam(':bracketId',      $bracketId);
    $statement->execute();

    $connection = null;
    return updateEntries( $bracketId, $bracket->entries );
}

function updateEntries( $bracketId, $entries )
{
    $queryNameCase  = "CASE ";
    $queryImageCase = "CASE ";
    for ( $i = 0; $i < count( $entries ); $i++ )
    {
        $queryNameCase  .= "WHEN seed = :entrySeed$i THEN :entryName$i ";
        $queryImageCase .= "WHEN seed = :entrySeed$i THEN :entryImage$i ";
    }
    $queryNameCase  .= "END";
    $queryImageCase .= "END";
    $query     = "UPDATE entries
                  SET name = ($queryNameCase),
                      image = ($queryImageCase)
                  WHERE bracket_id = :bracketId ";

    $connection = getConnection();
    $statement = $connection->prepare( $query );

    for ( $i = 0; $i < count( $entries ); $i++ )
    {
        $entry = $entries[$i];
        $statement->bindParam(":entrySeed$i",  $entry->seed);
        $statement->bindParam(":entryName$i",  $entry->name);
        $statement->bindParam(":entryImage$i", $entry->image);
    }
    $statement->bindParam(':bracketId', $bracketId);

    $statement->execute();

    $connection = null;
    return $bracketId;
}

function getAllBracketMetas()
{
    $query = "SELECT
                id,
                date,
                state,
                title,
                image,
                help,
                mode
              FROM meta
              WHERE state != 'hidden'
              ORDER BY title DESC ";
    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->execute();

    $metas = $statement->fetchAll();

    $connection = null;
    return $metas;
}

function getBracketMeta( $bracketId )
{
    $query = "SELECT title, image, help FROM meta WHERE id = :bracketId ";
    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':bracketId', $bracketId);
    $statement->execute();

    $meta = $statement->fetch();

    $connection = null;
    return $meta;
}

function getBracketId( $title )
{
    $query = "SELECT id FROM meta WHERE title = :title LIMIT 1 ";
    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':title', $title);
    $statement->execute();

    $id = $statement->fetch();

    $connection = null;
    return $id;
}

function getWinners( $bracketId )
{
    $query = "SELECT top_wins FROM results WHERE bracket_id = :bracketId ";
    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':bracketId', $bracketId);
    $statement->execute();

    $winners = $statement->fetch();

    $connection = null;
    return $winners;
}

function isVotingAllowed( $bracketId )
{
    $query = "SELECT (CASE WHEN state = 'active' THEN '1' ELSE '' END) FROM meta WHERE id = :bracketId ";
    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':bracketId', $bracketId);
    $statement->execute();

    $isVotingAllowed = $statement->fetch();

    $connection = null;
    return $isVotingAllowed;
}

function setBracketState( $bracketId, $state )
{
    $query = "UPDATE meta SET state = :state WHERE id = :bracketId ";
    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':state', $state);
    $statement->bindParam(':bracketId', $bracketId);
    $statement->execute();

    $connection = null;
    return true;
}

function setCloseTime( $bracketId, $closeTime )
{
    $query = "UPDATE timing SET scheduled_close = :closeTime WHERE bracket_id = :bracketId ";
    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':closeTime', $closeTime);
    $statement->bindParam(':bracketId', $bracketId);
    $statement->execute();

    $connection = null;
    return true;
}

function startBracket( $bracketId, $closeTime )
{
    $state = "active";

    $query = "UPDATE meta m, timing t SET m.state = :state, t.scheduled_close = :closeTime WHERE m.id = :bracketId AND t.bracket_id = :bracketId ";
    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':state',     $state);
    $statement->bindParam(':closeTime', $closeTime);
    $statement->bindParam(':bracketId', $bracketId);
    $statement->execute();

    $connection = null;
    return true;
}

function getConnection()
{
    $servername = "localhost";
    $username   = "religiv3_admin";
    $password   = "1corinthians3:9";
    $dbname     = "religiv3_bracket";

    $connection = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $connection;
}

function getGUID()
{
	mt_srand((double)microtime()*10000);
	return strtoupper(md5(uniqid(rand(), true)));
}

if ( isset($_POST['action']) && function_exists( $_POST['action'] ) ) {
    $action = $_POST['action'];
    $result = null;

    try {
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
    catch ( PDOException $e ) {
        echo "Error: " . $e->getMessage();
    }
}