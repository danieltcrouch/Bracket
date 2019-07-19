<?php
include("php/startup.php");
require("php/database.php"); //todo - remove this from php files
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php includeHeadInfo(); ?>
    <script src="javascript/utility.js"></script>
    <link rel="stylesheet" type="text/css" href="https://religionandstory.com/bracket/css/bracket.css"/>
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
    //todo - move to helper file and use ajax calls
    let logos = [];
    logos = <?php
        print_r( json_encode( getAllMetas() ) );
    ?>;

    displayLogos( logos );

    const error = "<?php echo $_GET['error'] ?>";
    if ( error ) {
        showMessage( "Error", getErrorMessage( error ) );
    }

    function displayLogos( logos ) {
        let logosDiv = id('logos');
        for ( let i = 0; i < logos.length; i++ ) {
            let logoInfo = logos[i];
            logoInfo.helpImage = "<?php getHelpImage() ?>";
            let logoDiv = document.createElement( "DIV" );
            logoDiv.id = "logo" + i;
            logoDiv.style.margin = "0 3em 2em";
            logoDiv.classList.add( "title" );
            logoDiv.classList.add( "center" );
            logosDiv.appendChild( logoDiv );
            createTitleLogo( logoInfo, logoDiv, logoInfo.active, true, function() {
                window.location = "https://bracket.religionandstory.com/bracket.php?id=" + logoInfo.id;
            } );
        }
    }
</script>
<?php includeModals(); ?>
</html>