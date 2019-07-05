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
            <img style="width: .5em; padding-bottom: .25em" src="<?php getHelpImage() ?>" alt="help">
        </span></div>
        <div id="instructions" style="display: none">
            ...
        </div>
    </div>

    <!--Main-->
    <div class="col-10 main">
        <div class="col-5 center" style="padding-bottom: 1em">
            <input id="title"        type="text" class="input" placeholder="Bracket Title">
            <input id="imageAddress" type="text" class="input" placeholder="Image Address">
            <textarea id="rules"                 class="input" placeholder="Instructions"></textarea>
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
                <button id="preview" class="button" style="width: 8em; margin: .25em;">Preview</button>
            </div>

            <div id="bracketSettings" class="center" style="display: none; margin-bottom: 1em">
                <button id="match" name="bracketOption" class="button inverseButton" style="width: 5em; margin: .25em;">Match</button>
                <button id="round" name="bracketOption" class="button inverseButton" style="width: 5em; margin: .25em;">Round</button>
                <button id="open"  name="bracketOption" class="button inverseButton" style="width: 5em; margin: .25em;">Open</button>
            </div>
            <div id="frequencySettings" class="center" style="display: none; margin-bottom: 1em">
                <input id="title" type="datetime-local" class="input" placeholder="End Time">

                <div style="font-weight: bold; margin-bottom: .5em" >Or</div>

                Close voting
                <select id="frequency" class="select" style="width: auto" onchange="updateFrequencyPoints()">
                    <option value="X"     >--</option>
                    <option value="min"   >every minute</option>
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
                    <option value="X"     >--</option>
                </select>
                <button id="movie" name="entryType" class="button selectedButton" style="display: none; width: 8em; margin: .25em;">End Voting</button>
            </div>

            <div class="center" style="margin-bottom: 1em">
                <button id="create" class="button" style="width: 8em; margin: .25em;">Create</button>
                <button id="pause"  class="button" style="display: none; width: 8em; margin: .25em;">Pause</button>
            </div>
        </div>
    </div>

    <!--
    todo:

        Create/Edit Page:
        [* = grayed for Edit]
            *image and title for logo
                (title not required)
                Dynamic Preview
                explanation/rules
            *radio buttons for bracket vs poll
            *if bracket:
                mode - Match, Round, Open [may choose between match and round if previously chosen]
            if poll or not "open":
                set end time or choose frequency
                set frequency and frequency point--Close voting [DROPDOWN] at [DROPDOWN]
                    every minute [no choices]
                    every hour [0-59]
                    every day [every thirty minutes]
                    every two, three, seven [same as day]
                    every week [day of week (end)]
                    when I choose [allows user to come in and click "End Voting"]
                End Voting button [only appears on edit]
            *entering: number drop-down, dynamically make inputs for title and image
                Preview in new tab (POST data)
            Start [Create]/Pause [Edit]
                Start sends to bracket page
                Pause gives toaster to tell if active or inactive

            (if no ID in URL, prompt for user and then prompt for choosing bracket/poll)
                For now, default to single user (me)

            cap at 20 chars
            allow 128, but only display full bracket at 32 and below


        DATABASE:
        meta
            id
            name
            image
            info
            mode
        polling
            bracket_id
            active
            frequency
            frequency_point
            end_point
        entry
            bracket_id
            id
            name
            image
            seed


        Reminder for user: For split bracket, where one side ends going against another, alternate entries
    -->

</body>

<script>
    let logoInfo = {
        title:     "Your Bracket",
        image:     "<?php echo $image ?>",
        helpImage: "<?php getHelpImage() ?>",
        help:      "Additional instructions will appear here."
    };
    createTitleLogo( logoInfo, id('exampleLogo') );

    setRadioCallback( "bracketType", function( bracketType ) {
        setBracketType( bracketType );
    });
    setRadioCallback( "bracketOption", function( bracketOption ) {
        setBracketRoundType( bracketOption );
    });
</script>
<?php includeModals(); ?>
</html>