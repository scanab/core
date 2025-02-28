<?php
if (!isConnect()) {
	throw new Exception('{{401 - Accès non autorisé}}');
}
$list_view = view::all();
$view = null;
if (init('view_id') == '') {
	if ($_SESSION['user']->getOptions('defaultDesktopView') != '') {
		$view = view::byId($_SESSION['user']->getOptions('defaultDesktopView'));
	}
	if (!is_object($view) && isConnect('admin')) {
		$view = $list_view[0];
	}
} else {
	$view = view::byId(init('view_id'));
	if (!is_object($view)) {
		throw new Exception('{{Vue inconnue. Vérifier l\'ID.}}');
	}
}

if (!is_object($view) && count($list_view) > 0) {
	$view = $list_view[0];
}

if (is_object($view) && !$view->hasRight('r')) {
	$view = null;
	throw new Exception('{{Vous n\'avez pas le droit d\'accéder à cette vue.}}');
}

if (!is_object($view)) {
	if (isConnect('admin')) {
		throw new Exception('{{Aucune vue n\'existe, cliquez <a href="index.php?v=d&p=view_edit">ici</a> pour en créer une.}}');
	}
	sendVarToJS('jeephp2js.view_id', -1);
} else {
	sendVarToJS('jeephp2js.view_id', $view->getId());
}

?>

<div class="row row-overflow">
	<?php
	if ($_SESSION['user']->getOptions('displayViewByDefault') == 1 && init('report') != 1) {
		echo '<div class="col-lg-2 col-md-3 col-sm-4 div_displayViewList">';
	} else {
		echo '<div class="col-lg-2 col-md-3 col-sm-4 div_displayViewList" style="display:none;">';
	}
	?>
	<div class="bs-sidebar">
		<ul id="ul_viewSummary" class="nav nav-list bs-sidenav" style="font-size:0.9em;"></ul>
		<ul id="ul_view" class="nav nav-list bs-sidenav">
			<?php if (isConnect('admin')) { ?>
				<a class="btn btn-default bt_hideFullScreen" style="width : 100%;margin-top : 5px;margin-bottom: 5px;" href="index.php?v=d&p=view_edit"><i class="fas fa-plus-circle"></i> {{Ajouter une vue}}</a>
			<?php }
			?>
			<li class="filter"><input class="filter form-control input-sm" placeholder="{{Rechercher}}" style="width: 100%" /></li>
			<?php
			foreach ((view::all()) as $view_info) {
				if (!$view_info->hasRight('r')) {
					continue;
				}
				if ($view->getId() == $view_info->getId()) {
					echo '<li class="cursor li_view active"><a href="index.php?v=d&p=view&view_id=' . $view_info->getId() . '">' . trim($view_info->getDisplay('icon')) . ' ' . $view_info->getName() . '</a></li>';
				} else {
					echo '<li class="cursor li_view"><a href="index.php?v=d&p=view&view_id=' . $view_info->getId() . '">' . trim($view_info->getDisplay('icon')) . ' ' . $view_info->getName() . '</a></li>';
				}
			}
			?>
		</ul>
	</div>
</div>
<?php
if ($_SESSION['user']->getOptions('displayViewByDefault') == 1 && init('report') != 1) {
	echo '<div id="div_displayViewContainer" class="col-lg-10 col-md-9 col-sm-8 div_displayViewContainer">';
} else {
	echo '<div id="div_displayViewContainer" class="col-lg-12 col-md-12 col-sm-12 div_displayViewContainer">';
}
?>
<legend class="no-bordered center">
	<i class='far fa-image cursor pull-left bt_displayView reportModeHidden hidden-768' data-display='<?php echo $_SESSION['user']->getOptions('displayViewByDefault') ?>' title="{{Afficher/Masquer les vues}}"></i>
	<?php
	if (init('noControl') == '') {
		if (is_object($view) && isConnect('admin')) { ?>
			<a href="index.php?v=d&p=view_edit&view_id=<?php echo $view->getId(); ?>" class="btn btn-warning btn-xs pull-right reportModeHidden bt_hideFullScreen hidden-768"><i class="fas fa-pencil-alt"></i> {{Edition complète}}</a><?php }	?>
		<i class="fas fa-pencil-alt pull-right cursor reportModeHidden bt_hideFullScreen hidden-768" id="bt_editViewWidgetOrder" data-mode="0" title="{{Mode édition}}"></i>
	<?php } ?>
	<h3>
		<?php
			if (is_object($view)) {
				echo trim($view->getDisplay('icon')) . ' ' . $view->getName();
			}
		?>
	</h3>
</legend>
<div class="row div_displayView"></div>
</div>

</div>

<?php
include_file('desktop/common', 'ui', 'js');
include_file('desktop', 'view', 'js');
?>