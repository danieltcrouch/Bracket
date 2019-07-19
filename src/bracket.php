<?php
include("php/startup.php");
require("php/database.php");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php includeHeadInfo(); ?>
    <script src="javascript/bracket.js"></script>
    <script src="javascript/utility.js"></script>
    <link rel="stylesheet" type="text/css" href="https://religionandstory.com/bracket/css/bracket.css"/>
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
        <div id="bracketDisplay" class="center"></div>
        <div class="center"><button id="submit" class="button" style="width: 8em" onclick="submit()">Submit</button></div>
    </div>

    <!--
    todo:

        Bracket Page:
            Load from DB
            Save to DB
        (Session monitoring matters)
        If submit is within time-frame

        Allow users to subscribe
    -->

</body>

<script>
    const bracketId = "<?php echo $_GET['id'] ?>";

    let logoInfo = <?php echo ( $_GET['id'] === "PREVIEW" && $_POST['logo'] ) ? $_POST['logo'] : "{}"; ?>;
    let bracketInfo = <?php echo ( $_GET['id'] === "PREVIEW" && $_POST['bracket'] ) ? $_POST['bracket'] : "{}"; ?>;

    if ( bracketId !== "PREVIEW" ) {
        //AJAX call
        loadPage();
    }
    else {
        loadPage();
    }

    function loadPage() {
        if ( bracketId && logoInfo && bracketInfo ) {
            logoInfo.helpImage = "<?php getHelpImage() ?>";
            createTitleLogo( logoInfo, cl('title')[0], logoInfo.active, true );
            loadBracket( bracketInfo );
        }
        else {
            window.location = "https://bracket.religionandstory.com/home.php?error=InvalidBracketId";
        }
    }
</script>
<?php includeModals(); ?>
</html>