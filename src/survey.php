<?php include("php/startup.php"); ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php
    include_once("php/database.php");
    $meta = getSurveyMeta( $_GET['id'] );
    $pageTitle   = $meta ? $meta['title'] : $pageTitle;
    $image       = $meta ? $meta['image'] : $image;
    $description = $meta ? $meta['help']  : $description;
    includeHeadInfo();
    ?>
    <script src="javascript/survey.js"></script>
    <?php include_once("php/includes.php"); ?>
</head>

<body>

	<!--Header-->
    <?php includeHeader(); ?>
    <div class="col-10 header">
        <div class="title center"></div>
        <div id="helpText" style="display: none">
            Vote on entries to help find the winner for this bracket. Entries that are blinking are currently open for voting. Click &ldquo;Submit&rdquo; when finished.
        </div>
    </div>

    <!--Main-->
    <div class="col-10 main">
        <div id="roundPicker" class="center mobileDisplay" style="margin-bottom: 1em">
            <img id="arrowPrev" class="clickable" style="width: 1.5em" src="images/left.png"  alt="left"  onclick="changeRound( 'prev' )">
            <span id="roundSpan" class="subtitle center">Round 1</span>
            <img id="arrowNext" class="clickable" style="width: 1.5em" src="images/right.png" alt="right" onclick="changeRound( 'next' )">
        </div>
        <div id="roundTimer" class="center" style="display: none; font-size: 1.25em; margin-bottom: 1em"></div>
        <div id="surveyDisplay" class="center"></div>
        <div class="center" style="margin-bottom: 1em"><button id="submit" class="button" style="width: 8em" onclick="submit()">Submit</button></div>
        <div class="center" style="margin-bottom: 1em"><button id="result" class="button" style="width: 8em" onclick="review()">Review</button></div>
    </div>

    <!--
    todo 7:
        Update rounds and close time
        Delete unused DB columns
    -->

</body>

<script>
    const surveyId = "<?php echo $_GET['id'] ?>";
    const helpImage = "<?php getHelpImage() ?>";

    if ( surveyId === "PREVIEW" ) {
        loadPage( surveyId, <?php echo $_POST['survey']; ?> );
    }
    else {
        getSurveyInfo( surveyId );
    }
</script>
<?php includeModals(); ?>
</html>