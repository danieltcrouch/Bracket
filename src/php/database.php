<?php

function getSurvey( $surveyId )
{
    $query = "SELECT
                  m.id, m.state, m.title, m.image, m.help, m.type, m.mode,
                  t.frequency, t.frequency_point, t.scheduled_close, t.active_id,
                  r.winners,
                  current_votes,
                  e_names,
                  e_images
              FROM meta m
                  JOIN timing t ON m.id = t.meta_id
                  LEFT OUTER JOIN results r ON m.id = r.meta_id
                  LEFT OUTER JOIN (
                      SELECT
                          v.meta_id,
                          GROUP_CONCAT(CONCAT(v.choice_set_id, '|', v.choice_id) ORDER BY v.choice_id) as \"current_votes\"
                      FROM voting v
                          JOIN timing t ON v.meta_id = t.meta_id
                      WHERE active_id = '' OR choice_set_id LIKE CONCAT(active_id, '%')
                      GROUP BY v.meta_id
                  ) vot ON m.id = vot.meta_id
                  LEFT OUTER JOIN (
                      SELECT
                          c.meta_id,
                          GROUP_CONCAT(c.name ORDER BY c.seed) as \"e_names\",
                          GROUP_CONCAT(c.image ORDER BY c.seed) as \"e_images\"
                      FROM choices c
                      GROUP BY c.meta_id
                  ) ent ON m.id = ent.meta_id
              WHERE m.id = :surveyId ";
    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':surveyId', $surveyId);
    $statement->execute();

    $result = $statement->fetch();
    $surveyInfo = [
        'state'   => $result['state'],
        'title'   => $result['title'],
        'image'   => $result['image'],
        'help'    => $result['help'],
        'type'    => $result['type'],
        'mode'    => $result['mode'],
        'winners' => $result['winners'],
        'timing'  => [
            'frequency'      => $result['frequency'],
            'frequencyPoint' => $result['frequency_point'],
            'scheduledClose' => $result['scheduled_close'],
            'activeId'       => $result['active_id']
        ],
        'currentVotes' => [],
        'choices'      => []
    ];
    parseChoices( $surveyInfo['choices'], $result );
    parseVotes( $surveyInfo['currentVotes'], $result );

    $connection = null;
    return $surveyInfo;
}

function createSurvey( $survey )
{
    $surveyId = getGUID();
    $survey = json_decode( $survey );
    $choices = $survey->choices;
    $state = "active";
    $activeId = null;
    switch ( $survey->mode )
    {
    case "match":
        $activeId = "m0";
        break;
    case "round":
        $activeId = "r0";
        break;
    }

    $choiceValues = "";
    for ( $i = 0; $i < count( $choices ); $i++ )
    {
        $choiceValues .= ( $i != 0 ) ? ", " : "";
        $choiceValues .= "(:surveyId, :choiceId, :choiceName$i, :choiceImage$i, :choiceSeed$i)";
    }
    $insertMeta = "INSERT INTO meta (id, state, title, image, help, type, mode) VALUES (:surveyId, :state, :title, :image, :help, :type, :mode)";
    $insertTiming = "INSERT INTO timing (meta_id, frequency, frequency_point, scheduled_close, active_id) VALUES (:surveyId, :frequency, :frequencyPoint, :scheduledClose, :activeId)";
    $insertChoices = "INSERT INTO choices (meta_id, id, name, image, seed) VALUES $choiceValues";

    $query =
        "$insertMeta;\n
         $insertTiming;\n
         $insertChoices";

    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':surveyId',       $surveyId);
    $statement->bindParam(':state',          $state);
    $statement->bindParam(':title',          $survey->title);
    $statement->bindParam(':image',          $survey->image);
    $statement->bindParam(':help',           $survey->help);
    $statement->bindParam(':type',           $survey->type);
    $statement->bindParam(':mode',           $survey->mode);
    $statement->bindParam(':frequency',      $survey->frequency);
    $statement->bindParam(':frequencyPoint', $survey->frequencyPoint);
    $statement->bindParam(':scheduledClose', $survey->scheduledClose);
    $statement->bindParam(':activeId',       $activeId);
    for ( $i = 0; $i < count( $choices ); $i++ )
    {
        $choice = $choices[$i];
        $choiceId = getGUID();
        $statement->bindParam(":choiceId$i",    $choiceId);
        $statement->bindParam(":choiceSeed$i",  $choice->seed);
        $statement->bindParam(":choiceName$i",  $choice->name);
        $statement->bindParam(":choiceImage$i", $choice->image);
    }
    $statement->execute();

    $connection = null;
}

function updateSurvey($survey )
{
    $survey = json_decode( $survey );
    $surveyId = $survey->id;

    $query     = "UPDATE meta m, timing t
                  SET m.help = :help,
                      t.frequency = :frequency,
                      t.frequency_point = :frequencyPoint,
                      t.scheduled_close = :scheduledClose 
                  WHERE m.id = :surveyId
                    AND t.meta_id = :surveyId ";

    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':surveyId',       $surveyId);
    $statement->bindParam(':help',           $survey->help);
    $statement->bindParam(':frequency',      $survey->frequency);
    $statement->bindParam(':frequencyPoint', $survey->frequencyPoint);
    $statement->bindParam(':scheduledClose', $survey->scheduledClose);
    $statement->execute();

    $connection = null;
    return updateChoices( $surveyId, $survey->choices );
}

function updateChoices( $surveyId, $choices )
{
    $queryNameCase  = "CASE ";
    $queryImageCase = "CASE ";
    for ( $i = 0; $i < count( $choices ); $i++ )
    {
        $queryNameCase  .= "WHEN seed = :choiceSeed$i THEN :choiceName$i ";
        $queryImageCase .= "WHEN seed = :choiceSeed$i THEN :choiceImage$i ";
    }
    $queryNameCase  .= "END";
    $queryImageCase .= "END";
    $query     = "UPDATE choices
                  SET name = ($queryNameCase),
                      image = ($queryImageCase)
                  WHERE meta_id = :surveyId ";

    $connection = getConnection();
    $statement = $connection->prepare( $query );

    $statement->bindParam(':surveyId', $surveyId);
    for ( $i = 0; $i < count( $choices ); $i++ )
    {
        $choice = $choices[$i];
        $statement->bindParam(":choiceSeed$i",  $choice->seed);
        $statement->bindParam(":choiceName$i",  $choice->name);
        $statement->bindParam(":choiceImage$i", $choice->image);
    }

    $statement->execute();

    $connection = null;
    return $surveyId;
}

function getAllSurveyMetas()
{
    $query = "SELECT
                id,
                date,
                state,
                title,
                image,
                help,
                type,
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

function getSurveyMeta( $surveyId )
{
    $query = "SELECT title, image, help FROM meta WHERE id = :surveyId ";
    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':surveyId', $surveyId);
    $statement->execute();

    $meta = $statement->fetch();

    $connection = null;
    return $meta;
}

function getSurveyId( $title )
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

function getCurrentVotes( $surveyId )
{
    $query = "SELECT
                  GROUP_CONCAT(CONCAT(v.choice_set_id, '|', v.choice_id) ORDER BY v.choice_id) as \"current_votes\"
              FROM voting v
                  JOIN timing t ON v.meta_id = t.meta_id
              WHERE (active_id = '' OR choice_set_id LIKE CONCAT(active_id, '%'))
                  AND v.meta_id = :surveyId ";
    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':surveyId', $surveyId);
    $statement->execute();

    $result = $statement->fetch();
    $currentVotes = [];
    parseVotes( $currentVotes, $result );

    $connection = null;
    return $currentVotes;
}

//todo 10 - create a DB Service class that has the voting logic and the data parsing
function parseChoices(&$target, $data )
{
    $choiceNames  = explode( ',', $data['e_names'] );
    $choiceImages = explode( ',', $data['e_images'] );
    foreach( $choiceNames as $index => $name ) {
        array_push( $target, ['name' => $name, 'image' => $choiceImages[$index]] );
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
        if ( $index === false )
        {
            array_push( $matchIds, $values[0] );
            array_push( $result, [ "id" => $values[0], "choices" => [], "allVotes" => [ $values[1] ] ] );
        }
        else
        {
            array_push( $result[$index]['allVotes'], $values[1] );
        }
    }
    foreach( $result as $index => $match )
    {
        $votesByChoice = array_count_values( $match['allVotes'] );
        foreach( $votesByChoice as $seed => $count )
        {
            array_push( $result[$index]['choices'], ['seed' => $seed, 'count' => $count] );
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
        $result = "This survey is not currently active.";
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

function vote( $surveyId, $votes )
{
    $result['isSuccess'] = false;
    $votingConditions = getVoteConditions( $surveyId );
    $result['message'] = checkVote( $votingConditions, $votes );
    if ( !$result['message'] ) {
        $result['isSuccess'] = saveVote( $surveyId, $votes );
    }
    return $result;
}

function getVoteConditions( $surveyId )
{
    $query = "SELECT
                IF(m.state = 'active', '1', '') AS \"active\",
                t.active_id
              FROM meta m
                JOIN timing t ON m.id = t.meta_id
              WHERE m.id = :surveyId ";
    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':surveyId', $surveyId);
    $statement->execute();

    $result = $statement->fetch();
    $connection = null;
    return $result;
}

function saveVote( $surveyId, $votes )
{
    $voteId = getGUID();
    $userIp = $_SERVER['REMOTE_ADDR'];

    $query = "INSERT INTO voting
              (meta_id, id, user, choice_set_id, choice_id)
              VALUES ( :surveyId, :voteId, :userIp, :matchId, :choiceSeed )
              ON DUPLICATE KEY UPDATE
              choice_id = :choiceSeed ";

    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':surveyId', $surveyId);
    $statement->bindParam(':voteId',   $voteId);
    $statement->bindParam(':userIp',   $userIp);

    for ( $i = 0; $i < count( $votes ); $i++ )
    {
        $vote = $votes[$i];
        $statement->bindParam(':matchId',    $vote['id']);
        $statement->bindParam(':choiceSeed', $vote['vote']);
        $statement->execute();
    }

    return true;
}

function setSurveyState( $surveyId, $state )
{
    $query = "UPDATE meta SET state = :state WHERE id = :surveyId ";
    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':surveyId', $surveyId);
    $statement->bindParam(':state', $state);
    $statement->execute();

    $connection = null;
    return true;
}

function startSurvey( $surveyId, $closeTime )
{
    $state = "active";

    $query = "UPDATE meta m, timing t SET m.state = :state, t.scheduled_close = :closeTime WHERE m.id = :surveyId AND t.meta_id = :surveyId ";
    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':surveyId', $surveyId);
    $statement->bindParam(':state',     $state);
    $statement->bindParam(':closeTime', $closeTime);
    $statement->execute();

    $connection = null;
    return true;
}

function setCloseTime( $surveyId, $closeTime )
{
    $query = "UPDATE timing SET scheduled_close = :closeTime WHERE meta_id = :surveyId ";
    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':closeTime', $closeTime);
    $statement->bindParam(':surveyId', $surveyId);
    $statement->execute();

    $connection = null;
    return true;
}

function updateVotingSession( $surveyId, $state, $closeTime, $activeId, $winners )
{
    $query = "UPDATE meta m, timing t, results r
                SET m.state = :state, t.scheduled_close = :closeTime, t.active_id = :activeId, r.winners = :winners 
                WHERE m.id = :surveyId AND t.meta_id = :surveyId AND r.meta_id = :surveyId ";
    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':surveyId', $surveyId);
    $statement->bindParam(':state',     $state);
    $statement->bindParam(':closeTime', $closeTime);
    $statement->bindParam(':activeId',  $activeId);
    $statement->bindParam(':winners',   $winners);
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
        if ( isset($_POST['id']) && isset($_POST['state']) && isset($_POST['time']) && isset($_POST['activeId']) && isset($_POST['winners']) ) {
            $result = $action( $_POST['id'], $_POST['state'], $_POST['time'], $_POST['activeId'], $_POST['winners'] );
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
        elseif ( isset($_POST['survey']) ) {
            $result = $action( $_POST['survey'] );
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