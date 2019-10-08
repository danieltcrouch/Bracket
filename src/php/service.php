<?php

function updateSurvey( $survey )
{
    $survey = json_decode( $survey );
    $surveyId = $survey->id;

    updateSurveyMeta( $surveyId, $survey );
    return updateChoices( $surveyId, $survey->choices );
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

function emailSubscribers( $surveyId )
{
    $surveyMeta = getSurveyMeta( $surveyId );
    $addressList = getEmails( $surveyId );

    $to = implode( ',', $addressList );
    $subject = "Bracket Update: $surveyMeta[title]";
    $message = "<p>Hey, a bracket you subscribed to has finished voting! Check out the results <a href='https://bracket.religionandstory.com/survey.php?id=$surveyId'>here</a>!</p>";
    $message = wordwrap($message, 70);
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From:  ReligionAndStory<noreply@religionandstory.com>" . "\r\n" .
                "Bcc:   danieltcrouch@gmail.com";

    return mail($to, $subject, $message, $headers);
}

function parseVotes( $votes )
{
    $result = [];
    $matchIds = [];

    foreach( $votes as $vote )
    {
        $index = array_search( $vote['choice_set_id'], $matchIds );
        if ( $index === false )
        {
            array_push( $matchIds, $vote['choice_set_id'] );
            array_push( $result, [ "id" => $vote['choice_set_id'], "choices" => [], "allVotes" => [ $vote['choice_id'] ] ] );
        }
        else
        {
            array_push( $result[$index]['allVotes'], $vote['choice_id'] );
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

    return $result;
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