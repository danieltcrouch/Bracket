<?php
include("php/startup.php");
require("php/postToSession.php");
require("php/bracketParse.php");
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

        Allow users to subscribe
    -->

</body>

<script>
    let logoInfo = {};
    logoInfo = <?php getLogoInfo(); ?>;

    let bracketInfo = {};
    bracketInfo = <?php getBracketInfo(); ?>;

    if ( "<?php echo $_GET['id'] ?>" ) {
        logoInfo.helpImage = "<?php getHelpImage() ?>";
        createTitleLogo( logoInfo, cl('title')[0], true );
        loadBracket( bracketInfo );
    }
    else {
        window.location = "https://bracket.religionandstory.com/home.php?error=NoBracketId";
    }
</script>
<?php includeModals(); ?>
</html>