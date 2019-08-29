<?php include("php/startup.php"); ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php includeHeadInfo(); ?>
    <script src="javascript/edit.js"></script>
    <?php include_once("php/includes.php"); ?>
</head>

<body>

	<!--Header-->
    <?php includeHeader(); ?>
    <div class="col-10 header">
        <div class="title center"><span class="clickable">
            Edit Survey
            <img id="helpIcon" style="width: .5em; padding-bottom: .25em" src="<?php getHelpImage() ?>" alt="help">
        </span></div>
        <div id="helpText" style="display: none">
            ...
        </div>
    </div>

    <!--Main-->
    <div class="col-10 main">
        <div class="col-5" style="padding-bottom: 1em">
            <input id="titleInput" type="text" class="input" maxlength="20" placeholder="Survey Title">
            <input id="imageInput" type="text" class="input" placeholder="Image Address">
            <textarea id="helpInput" class="input" placeholder="Instructions"></textarea>
            <button id="previewLogo" class="button" style="width: 8em; margin: .25em;" onclick="previewLogo()">Preview</button>
        </div>
        <div class="col-5 center" style="padding-bottom: 0">
            <div id="exampleLogo" class="exampleTitle center"></div>
        </div>

        <div class="col-10 main">
            <div class="center" style="margin-bottom: 1em">
                <button id="bracket" name="surveyType" class="button inverseButton" style="width: 8em; margin: .25em;">Bracket</button>
                <button id="poll"    name="surveyType" class="button inverseButton" style="width: 8em; margin: .25em;">Poll</button>
            </div>

            <div id="choiceDiv" class="center" style="display: none; margin-bottom: 1em">
                <input id="choiceCount" type="number" class="input" placeholder="Number of Choices" onkeyup="submitChoiceCount( event )">
            </div>

            <div id="bracketSettings" class="center" style="display: none; margin-bottom: 1em">
                <button id="match" name="votingType" class="button inverseButton" style="width: 5em; margin: .25em;">Match</button>
                <button id="round" name="votingType" class="button inverseButton" style="width: 5em; margin: .25em;">Round</button>
                <button id="open"  name="votingType" class="button inverseButton" style="width: 5em; margin: .25em;">Open</button>
            </div>
            <div id="frequencySettings" class="center" style="display: none; margin-bottom: 1em">
                Close voting
                <select id="frequency" class="select" style="width: auto" onchange="updateFrequencyPoints()">
                    <option value="X"    >--</option>
                    <option value="hour" >every hour</option>
                    <option value="1day" >every day</option>
                    <option value="2days">every two days</option>
                    <option value="3days">every three days</option>
                    <option value="7days">every seven days</option>
                    <option value="week" >every week</option>
                </select>
                at
                <select id="frequencyPoint" class="select" style="width: auto">
                    <option value="X">--</option>
                </select>

                <div style="font-size: .75em">The first round will last at least one hour for &ldquo;every hour&rdquo; or one day otherwise.</div>
            </div>
            <div id="scheduleSettings" class="center" style="display: none; margin-bottom: 1em">
                <span style="font-weight: bold">Scheduled Close Time:</span>
                <input id="scheduledClose" type="datetime-local" class="input">
                <!-- todo 8: eventually, build your own date-time picker -->
            </div>

            <!-- reduce buttons displayed on edit page (max of four) -->
            <div class="center" style="margin-bottom: 1em">
                <button id="previewSurvey" class="button" style="display: none; width: 8em; margin: .25em;" onclick="previewSurvey()">Preview</button>
            </div>
            <div class="center" style="margin-bottom: 1em">
                <button id="review" class="button" style="display: none; width: 8em; margin: .25em;" onclick="review()">Review</button>
            </div>
            <div class="center" style="margin-bottom: 1em">
                <button id="create" class="button" style="width: 8em; margin: .25em;" onclick="create()">Create</button>
                <button id="save" class="button" style="display: none; width: 8em; margin: .25em;" onclick="save()">Save</button>
            </div>
            <div class="center" style="margin-bottom: 1em">
                <button id="pause" class="button" style="display: none; width: 8em; margin: .25em;" onclick="pause()">Pause</button>
            </div>
            <div class="center" style="margin-bottom: 1em">
                <button id="start" class="button" style="display: none; width: 8em; margin: .25em;" onclick="start()">Start</button>
                <button id="close" class="button" style="display: none; width: 8em; margin: .25em;" onclick="close()">Close</button>
                <button id="hide" class="button" style="display: none; width: 8em; margin: .25em;" onclick="hide()">Hide</button>
            </div>
            <div class="center" style="margin-bottom: 1em">
                <button id="load" class="button" style="width: 8em; margin: .25em;" onclick="load()">Load</button>
            </div>
        </div>
    </div>

    <form id="previewForm" method="POST" target="_blank" action="/survey.php?id=PREVIEW">
        <input name="survey" id="surveyInfo" type="hidden">
    </form>

</body>

<script>
    const surveyId = "<?php echo $_GET['id'] ?>";
    const helpImage = "<?php getHelpImage() ?>";

    if ( surveyId ) {
        initializeEdit( surveyId );
    }
    else {
        initializeCreate();
    }

    setRadioCallback( "surveyType", function( surveyType ) {
        setSurveyType( surveyType );
    });
    setRadioCallback( "votingType", function( votingType ) {
        setVotingType( votingType );
    });
</script>
<?php includeModals(); ?>
</html>