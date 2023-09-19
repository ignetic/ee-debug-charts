<?php 

if (file_exists(__DIR__.'/language/english/ee_debug_charts_lang.php')) {
    include_once __DIR__.'/language/english/ee_debug_charts_lang.php';
}

$config['name']           = isset($lang['ee_debug_charts_module_name']) ? $lang['ee_debug_charts_module_name'] : 'EE Debug Charts';
$config['description']    = isset($lang['ee_debug_charts_module_description']) ? $lang['ee_debug_charts_module_description'] : '';
$config['version']        = '1.0.0';
$config['author']         = 'Simon Andersohn';
$config['author_url']     = 'https://github.com/ignetic';
$config['docs_url']       = 'https://github.com/ignetic';
$config['namespace']      = 'Ignetic\EeDebugCharts';
$config['settings_exist'] = false;

if (!defined('EE_DEBUG_CHARTS_VER')) {
    define('EE_DEBUG_CHARTS_VER', $config['version']);
    define('EE_DEBUG_CHARTS_NAME', $config['name']);
    define('EE_DEBUG_CHARTS_DESCRIPTION', $config['description']);
    define('EE_DEBUG_CHARTS_SETTINGS_EXIST', $config['settings_exist']);
    define('EE_DEBUG_CHARTS_DOCS_URL', $config['docs_url']);
}

return $config;
