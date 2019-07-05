<?php include("php/startup.php"); ?>
<!DOCTYPE html>
<html lang="en">
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

    <!--Main-->
    <div class="col-10 main">
        <div class="subtitle center">This Page is under construction</div>
        <br/>
        <div class="textBlock center">
            Contact <a class="link" href="mailto:dcrouch1@harding.edu?Subject=Bracket" target="_top">Daniel Crouch</a> for any questions regarding this page.
        </div>
        <div class="center"><img src="<?php getConstructionImage(); ?>" width="300px"></div>
    </div>

    <!--
    todo:

        Home Page:
            dynamic columns of logos
                gray image for inactive brackets; state inactive under

        Link at the bottom for getting to edit/create page
        COMMENT-OUT for now
    -->

</body>
<?php includeModals(); ?>
</html>