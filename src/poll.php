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
            <img id="helpIcon" style="width: .5em; padding-bottom: .25em" src="<?php getHelpImage() ?>" alt="help">
        </span></div>
        <div id="helpText" style="display: none">
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
    todo 4:

        Poll Page:
            Logo
            Explanation
            Radio button choices
            Round end date/time
            Show poll results thus far
        (Session monitoring matters)
    -->

</body>

<script>
    const pollId = "<?php echo $_GET['id'] ?>";
    const helpImage = "<?php getHelpImage() ?>";

    if ( pollId !== "PREVIEW" ) {
        //getPollData( bracketId );
    }
    else {
        loadPage( bracketId, <?php echo ( $_GET['id'] === "PREVIEW" && $_POST['bracket'] ) ? $_POST['bracket'] : "null"; ?> );
    }
</script>
<?php includeModals(); ?>
</html>