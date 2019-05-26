<?php include("php/startup.php"); ?>
<!DOCTYPE html>
<html>
<head>
    <?php includeHeadInfo(); ?>
</head>

<body>

	<!--Header-->
    <?php includeHeader(); ?>
    <div class="col-10 header">
        <div class="title center"><span class="clickable">
            Bracket Central
            <img style="width: .5em; padding-bottom: .25em" src="<?php getHelpImage() ?>" alt="help">
        </span></div>
        <div id="instructions" style="display: none">
            ...
        </div>
    </div>

<!--
todo:
    Create/Edit Page:
        image for logo
        title - will need to limit so that it fits over image; will be used in logo
        explanation/rules
        textarea for entering entries
            markup code for entering other fields--dynamically parse label/info and image tag
        radio button for bracket vs poll
        timer for each round, or allow entering individual times per round
        (be able to bring up bracket to inactivate)
        (be able to manually edit results if need be)
    Home Page:
        dynamic columns of logos
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
    Poll Page:
        Logo
        Explanation
        Radio button choices
        Round end date/time
    (Session monitoring matters)

    Multi tiered list
    Print list
    Print buttons with alert
    Print grouped buttons
    Print buttons in different columns
    Print in bracket format without lines
    Print in bracket format (do I need lines?)
    Be able to select buttons in pair
    Add thumbnail to item
    Prettify, including gray out previous rounds
    (Phone only displays current round with tabs for displaying previous rounds)
-->

    <!--Main-->
    <div class="col-10 main">
        <div class="title center">This Page is under construction</div>
        <br/>
        <div class="textBlock center">
            Contact <a class="link" href="mailto:dcrouch1@harding.edu?Subject=Bracket" target="_top">Daniel Crouch</a> for any questions regarding this page.
        </div>
        <div class="center"><img src="<?php getConstructionImage(); ?>" width="300px"></div>
    </div>

</body>
<?php includeModals(); ?>
</html>