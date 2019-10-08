<?php include("php/startup.php"); ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php includeHeadInfo(); ?>
    <?php include_once("php/includes.php"); ?>
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
        <div class="subtitle center">Choose a bracket or poll</div>
        <br/>
        <div id="logos" style="display: flex; flex-direction: row; flex-wrap: wrap; justify-content: center;"></div>
    </div>

</body>

<script>
    //TODO - do general clean-up for this whole project
    const error = "<?php echo $_GET['error'] ?>";

    $.post(
        "php/controller.php",
        {
            action: "getAllSurveyMetas"
        },
        function ( response ) {
            displayLogos( jsonParse( response ) );
            if ( error ) {
                showMessage( "Error", getErrorMessage( error ) );
            }
        }
    );

    function displayLogos( logos ) {
        if ( logos ) {
            let logosDiv = id('logos');
            for ( let i = 0; i < logos.length; i++ ) {
                let logoInfo = logos[i];
                if ( logoInfo.state !== "ready" ) {
                    logoInfo.helpImage = "<?php getHelpImage() ?>";
                    let logoDiv = document.createElement( "DIV" );
                    logoDiv.id = "logo" + i;
                    logoDiv.style.margin = "0 3em 2em";
                    logoDiv.classList.add( "title" );
                    logoDiv.classList.add( "center" );
                    logosDiv.appendChild( logoDiv );
                    const isActive = logoInfo.state === "active"
                    createTitleLogo( logoInfo, logoDiv, isActive, true, "https://bracket.religionandstory.com/survey.php?id=" + logoInfo.id );
                }
            }
        }
    }
</script>
<?php includeModals(); ?>
</html>