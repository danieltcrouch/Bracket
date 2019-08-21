<?php

function getBracket( $bracketId )
{
    $query = "SELECT
                  m.id, m.state, m.title, m.image, m.help, m.mode,
                  t.frequency, t.frequency_point, t.scheduled_close, t.active_id,
                  r.index_wins,
                  current_votes,
                  e_names,
                  e_images
              FROM meta m
                  JOIN timing t ON m.id = t.bracket_id
                  LEFT OUTER JOIN results r ON m.id = r.bracket_id
                  LEFT OUTER JOIN (
                      SELECT
                          v.bracket_id,
                          GROUP_CONCAT(CONCAT(v.match_id, '|', v.entry_seed)) as \"current_votes\"
                      FROM voting v
                          JOIN timing t ON v.bracket_id = t.bracket_id
                      WHERE active_id = '' OR match_id LIKE (active_id + '%')
                      GROUP BY v.bracket_id
                  ) vot ON m.id = vot.bracket_id
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
            'scheduledClose' => $result['scheduled_close'],
            'activeId'       => $result['active_id']
        ],
        'currentVotes' => [],
        'entries'      => []
    ];
    parseEntries( $bracketInfo['entries'], $result );
    parseVotes( $bracketInfo['currentVotes'], $result );

    $connection = null;
    return $bracketInfo;
}

function createBracket( $bracket )
{
    $bracketId = getGUID();
    $bracket = json_decode( $bracket );
    $entries = $bracket->entries;
    $state = "active";
    $activeId = null;
    switch ( $bracket->mode )
    {
    case "match":
        $activeId = "m0";
        break;
    case "round":
        $activeId = "r0";
        break;
    default:
        $activeId = "";
    }

    $entryValues = "";
    for ( $i = 0; $i < count( $entries ); $i++ )
    {
        $entryValues .= ( $i != 0 ) ? ", " : "";
        $entryValues .= "(:bracketId, :entryId, :entryName$i, :entryImage$i, :entrySeed$i)";
    }
    $insertMeta = "INSERT INTO meta (id, state, title, image, help, mode) VALUES (:bracketId, :state, :title, :image, :help, :mode)";
    $insertTiming = "INSERT INTO timing (bracket_id, frequency, frequency_point, scheduled_close, active_id) VALUES (:bracketId, :frequency, :frequencyPoint, :scheduledClose, :activeId)";
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
    $statement->bindParam(':activeId',       $activeId);
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
    $statement->bindParam(':bracketId',      $bracketId);
    $statement->bindParam(':help',           $bracket->help);
    $statement->bindParam(':mode',           $bracket->mode);
    $statement->bindParam(':frequency',      $bracket->frequency);
    $statement->bindParam(':frequencyPoint', $bracket->frequencyPoint);
    $statement->bindParam(':scheduledClose', $bracket->scheduledClose);
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

    $statement->bindParam(':bracketId', $bracketId);
    for ( $i = 0; $i < count( $entries ); $i++ )
    {
        $entry = $entries[$i];
        $statement->bindParam(":entrySeed$i",  $entry->seed);
        $statement->bindParam(":entryName$i",  $entry->name);
        $statement->bindParam(":entryImage$i", $entry->image);
    }

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

function getCurrentVotes( $bracketId )
{
    $query = "SELECT
                  GROUP_CONCAT(CONCAT(v.match_id, '|', v.entry_seed)) as \"current_votes\"
              FROM voting v
                  JOIN timing t ON v.bracket_id = t.bracket_id
              WHERE (active_id = '' OR match_id LIKE (active_id + '%'))
                  AND v.bracket_id = :bracketId ";
    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':bracketId', $bracketId);
    $statement->execute();

    $result = $statement->fetch();
    $currentVotes = [];
    parseVotes( $currentVotes, $result );

    $connection = null;
    return $currentVotes;
}

function getWinners( $bracketId )
{
//    $query = "SELECT index_wins FROM results WHERE bracket_id = :bracketId ";
//    $connection = getConnection();
//    $statement = $connection->prepare( $query );
//    $statement->bindParam(':bracketId', $bracketId);
//    $statement->execute();
//
//    $winners = $statement->fetch();
//
//    $connection = null;
//    return $winners;
}

//todo 10 - create a DB Service class that has the voting logic and the data parsing
function parseEntries( &$target, $data )
{
    $entryNames  = explode( '|', $data['e_names'] );
    $entryImages = explode( '|', $data['e_images'] );
    foreach( $entryNames as $index => $name ) {
        array_push( $target, ['name' => $name, 'image' => $entryImages[$index]] );
    }
}

function parseVotes( &$target, $data )
{
    $result = [];
    $matchIds = [];
    $votes = explode( ',', $data['current_votes'] );
    foreach( $votes as $value )
    {
        $values = explode( '|', $value );
        $index = array_search( $values[0], $matchIds );
        if ( $index >= 0 )
        {
            array_push( $result[$index]['entries'], $values[1] );
        }
        else
        {
            array_push( $matchIds, $values[0] );
            array_push( $result, [ "id" => $values[0], "entries" => [], "allVotes" => [ $values[1] ] ] );
        }
    }
    foreach( $result as $match => $index )
    {
        $votesByEntry = array_count_values( $match['allVotes'] );
        foreach( $votesByEntry as $seed => $count )
        {
            array_push( $result[$index]['entries'], ['seed' => $seed, 'count' => $count] );
        }
        unset( $result[$index]['allVotes'] );
    }
    $target = $result;
}

function checkVote( $votingConditions, $votes )
{
    $result = null;

    if ( !$votingConditions['active'] )
    {
        $result = "This bracket is not currently active.";
    }
    elseif ( $votingConditions['active_id'] )
    {
        for ( $i = 0; $i < count( $votes ); $i++ )
        {
            if ( strpos( $votes[$i]['id'], $votingConditions['active_id'] ) === false )
            {
                $result = "The voting window for these matches has closed.";
                break;
            }
        }
    }

    return $result;
}

function vote( $bracketId, $votes )
{
    $result['isSuccess'] = false;
    $votingConditions = getVoteConditions( $bracketId );
    $result['message'] = checkVote( $votingConditions, $votes );
    if ( !$result['message'] ) {
        $result['isSuccess'] = saveVote( $bracketId, $votes );
    }
    return $result;
}

function getVoteConditions( $bracketId )
{
    $query = "SELECT
                IF(m.state = 'active', '1', '') AS \"active\",
                t.active_id
              FROM meta m
                JOIN timing t ON m.id = t.bracket_id
              WHERE m.id = :bracketId ";
    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':bracketId', $bracketId);
    $statement->execute();

    $result = $statement->fetch();
    $connection = null;
    return $result;
}

function saveVote( $bracketId, $votes )
{
    $voteId = getGUID();
    $userIp = $_SERVER['REMOTE_ADDR'];

    $query = "INSERT INTO voting
              (bracket_id, id, user, match_id, entry_seed)
              VALUES ( :bracketId, :voteId, :userIp, :matchId, :entrySeed )
              ON DUPLICATE KEY UPDATE
              entry_seed = :entrySeed ";

    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':bracketId', $bracketId);
    $statement->bindParam(':voteId',    $voteId);
    $statement->bindParam(':userIp',    $userIp);

    for ( $i = 0; $i < count( $votes ); $i++ )
    {
        $vote = $votes[$i];
        $statement->bindParam(':matchId',   $vote['id']);
        $statement->bindParam(':entrySeed', $vote['entrySeed']);
        $statement->execute();
    }

    return true;
}

function setBracketState( $bracketId, $state )
{
    $query = "UPDATE meta SET state = :state WHERE id = :bracketId ";
    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':bracketId', $bracketId);
    $statement->bindParam(':state', $state);
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
    $statement->bindParam(':bracketId', $bracketId);
    $statement->bindParam(':state',     $state);
    $statement->bindParam(':closeTime', $closeTime);
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

function updateVotingPeriod( $bracketId, $closeTime, $activeId )
{
    $query = "UPDATE timing SET scheduled_close = :closeTime, active_id = :activeId WHERE bracket_id = :bracketId ";
    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':bracketId', $bracketId);
    $statement->bindParam(':closeTime', $closeTime);
    $statement->bindParam(':activeId',  $activeId);
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
        if ( isset($_POST['id']) && isset($_POST['time']) && isset($_POST['activeId']) ) {
            $result = $action( $_POST['id'], $_POST['state'], $_POST['activeId'] );
        }
        elseif ( isset($_POST['id']) && isset($_POST['state']) ) {
            $result = $action( $_POST['id'], $_POST['state'] );
        }
        elseif ( isset($_POST['id']) && isset($_POST['time']) ) {
            $result = $action( $_POST['id'], $_POST['time'] );
        }
        elseif ( isset($_POST['id']) && isset($_POST['votes']) ) {
            $result = $action( $_POST['id'], $_POST['votes'] );
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