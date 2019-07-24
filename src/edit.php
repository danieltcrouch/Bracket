<?php include("php/startup.php"); ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php includeHeadInfo(); ?>
    <script src="javascript/edit.js"></script>
    <script src="javascript/utility.js"></script>
    <link rel="stylesheet" type="text/css" href="https://religionandstory.com/bracket/css/bracket.css"/>
</head>

<body>

	<!--Header-->
    <?php includeHeader(); ?>
    <div class="col-10 header">
        <div class="title center"><span class="clickable">
            Edit Bracket
            <img id="helpIcon" style="width: .5em; padding-bottom: .25em" src="<?php getHelpImage() ?>" alt="help">
        </span></div>
        <div id="helpText" style="display: none">
            ...
        </div>
    </div>

    <!--Main-->
    <div class="col-10 main">
        <div class="col-5" style="padding-bottom: 1em">
            <input id="titleText"    type="text" class="input" maxlength="20" placeholder="Bracket Title">
            <input id="imageAddress" type="text" class="input"                placeholder="Image Address">
            <textarea id="additionalHelpText" class="input" placeholder="Instructions"></textarea>
            <button id="previewLogo" class="button" style="width: 8em; margin: .25em;" onclick="previewLogo()">Preview</button>
        </div>
        <div class="col-5 center" style="padding-bottom: 0">
            <div id="exampleLogo" class="exampleTitle center"></div>
        </div>

        <div class="col-10 main">
            <div class="center" style="margin-bottom: 1em">
                <button id="bracket" name="bracketType" class="button inverseButton" style="width: 8em; margin: .25em;">Bracket</button>
                <button id="poll"    name="bracketType" class="button inverseButton" style="width: 8em; margin: .25em;">Poll</button>
            </div>

            <div id="entryDiv" class="center" style="display: none; margin-bottom: 1em">
                <input id="entryCount" type="number" class="input" placeholder="Number of Entries" onkeyup="createEntryInputs( event )">
            </div>
            <div id="previewDiv" class="center" style="display: none; margin-bottom: 1em">
                <button id="previewBracket" class="button" style="width: 8em; margin: .25em;" onclick="previewBracket()">Preview</button>
            </div>

            <div id="bracketSettings" class="center" style="display: none; margin-bottom: 1em">
                <button id="match" name="votingType" class="button inverseButton" style="width: 5em; margin: .25em;">Match</button>
                <button id="round" name="votingType" class="button inverseButton" style="width: 5em; margin: .25em;">Round</button>
                <button id="open"  name="votingType" class="button inverseButton" style="width: 5em; margin: .25em;">Open</button>
            </div>
            <div id="frequencySettings" class="center" style="display: none; margin-bottom: 1em">
                Close voting
                <select id="frequency" class="select" style="width: auto" onchange="updateFrequencyPoints()">
                    <option value="X"     >--</option>
                    <option value="hour"  >every hour</option>
                    <option value="day"   >every day</option>
                    <option value="2days" >every two days</option>
                    <option value="3days" >every three days</option>
                    <option value="7days" >every seven days</option>
                    <option value="week"  >every week</option>
                    <option value="custom">when I choose</option>
                </select>
                at
                <select id="frequencyPoint" class="select" style="width: auto">
                    <option value="X">--</option>
                </select>

                <div style="font-size: .75em">The first round will last at least one hour for &ldquo;every hour&rdquo; or one day otherwise.</div>
            </div>
            <div id="closeSettings" class="center" style="display: none; margin-bottom: 1em">
                <span style="font-weight: bold">Scheduled Close Time:</span>
                <input id="closeInput" type="datetime-local" class="input">
                <!-- todo: eventually, build your own -->
            </div>

            <div class="center" style="margin-bottom: 1em">
                <button id="create" class="button" style="width: 8em; margin: .25em;" onclick="create()">Create</button>
                <button id="save" class="button" style="display: none; width: 8em; margin: .25em;" onclick="save()">Save</button>
            </div>
            <div class="center" style="margin-bottom: 1em">
                <button id="load" class="button" style="width: 8em; margin: .25em;" onclick="load()">Load</button>
            </div>
            <div class="center" style="margin-bottom: 1em">
                <button id="pause"  class="button" style="display: none; width: 8em; margin: .25em;" onclick="pause()">Pause</button>
                <button id="close"  class="button" style="display: none; width: 8em; margin: .25em;" onclick="close()">Close</button>
            </div>
        </div>
    </div>

    <form id="previewForm" method="POST" target="_blank" action="/bracket.php?id=PREVIEW">
        <input name="bracket" id="bracketData" type="hidden">
    </form>

    <!--
    todo:

        Create/Edit Page:
            Polls need option show results after choice is made
            Pause buttons
            Pause gives toaster to tell if active or inactive
    -->

</body>

<script>
    const bracketId = "<?php echo $_GET['id'] ?>";
    const helpImage = "<?php getHelpImage() ?>";

    if ( bracketId ) {
        initializeEdit( bracketId );
    }
    else {
        initializeCreate();
    }

    setRadioCallback( "bracketType", function( bracketType ) {
        setBracketType( bracketType );
    });
    setRadioCallback( "votingType", function( votingType ) {
        setBracketRoundType( votingType );
    });
</script>
<?php includeModals(); ?>
</html>