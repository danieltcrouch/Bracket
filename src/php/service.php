<?php

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

function checkVote( $votingConditions, $votes )
{
    $result = null;

    if ( !$votingConditions['active'] )
    {
        $result = "This survey is not currently active.";
    }
    elseif ( $votingConditions['active_id'] )
    {
        for ( $i = 0; $i < sizeof( $votes ); $i++ )
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

function startSurvey( $surveyId, $activeId, $closeTime )
{
    return updateVotingSession( $surveyId, "active", $closeTime, $activeId, "" );
}

function updateVotingSession( $surveyId, $state, $closeTime, $activeId, $winners )
{
    updateWinners( $surveyId, $winners );
    return updateTiming( $surveyId, $state, $closeTime, $activeId );
}

function parseChoices(&$target, $rawNames, $rawImages )
{
    $choiceNames  = explode( ',', $rawNames );
    $choiceImages = explode( ',', $rawImages );
    foreach( $choiceNames as $index => $name ) {
        array_push( $target, ['name' => $name, 'image' => $choiceImages[$index]] );
    }
}

function parseVotes( &$target, $rawVotes )
{
    $result = [];
    $matchIds = [];
    $votes = $rawVotes ? explode( ',', $rawVotes ) : [];
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
        foreach( $votesByChoice as $id => $count )
        {
            array_push( $result[$index]['choices'], ['id' => $id, 'count' => $count] );
        }
        unset( $result[$index]['allVotes'] );
    }
    $target = $result;
}

function getGUID()
{
	mt_srand((double)microtime()*10000);
	return strtoupper(md5(uniqid(rand(), true)));
}

function getNullValue( $value )
{
	return $value ? $value : null;
}

?>