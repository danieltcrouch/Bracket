<?php include("php/startup.php"); ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php includeHeadInfo(); ?>
    <script src="javascript/bracket.js"></script>
</head>

<body>

	<!--Header-->
    <?php includeHeader(); ?>
    <!-- todo: use something more standard than "col" class for mobile development -- look into bootstrap and competitors -->
    <div class="col-10 header">
        <div class="title center"><span class="clickable">
            Bracket Central
            <img style="width: .5em; padding-bottom: .25em" src="<?php getHelpImage() ?>" alt="help">
        </span></div>
        <div id="instructions" style="display: none">
            ...
        </div>
    </div>

    <!--Main-->
    <div class="col-10 main">
        <div class="subtitle center" style="margin-bottom: 1em">This Bracket</div>
        <div id="bracketDisplay" class="center">...</div>
    </div>

    <!--
    todo:

        Bracket Page:
            Logo - click for explanation
                Make image into circle
                Large block font on top of image
            Visual Bracket
                click on bracket to vote
                    DB call - if fail, save off to file - if fail, toaster
                side button to open up pop-up with other info, pictures, etc. (maybe does it for entire match-up?)
                on mobile screen, only show current round (so vertical, no horizontal)
                http://www.aropupu.fi/bracket/
                https://www.w3schools.com/tags/canvas_lineto.asp
            Round end date/time
        (Allow instant Bracket, round polling, and match polling)

        Add thumbnail to item
        Prettify, including gray out previous rounds
        (Phone only displays current round with tabs for displaying previous rounds)
    -->

</body>

<script>
    loadBracket();
</script>
<?php includeModals(); ?>
</html>