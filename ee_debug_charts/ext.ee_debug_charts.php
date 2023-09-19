<?php

if (! defined('BASEPATH')) {
    exit('No direct script access allowed');
}

require_once 'addon.setup.php';

class Ee_debug_charts_ext
{
    var $name           = EE_DEBUG_CHARTS_NAME;
    var $version        = EE_DEBUG_CHARTS_VER;
    var $description    = EE_DEBUG_CHARTS_DESCRIPTION;
    var $settings_exist = EE_DEBUG_CHARTS_SETTINGS_EXIST;
    var $docs_url       = EE_DEBUG_CHARTS_DOCS_URL;

    var $settings       = array();

    /**
     * Constructor
     *
     * @param   mixed   Settings array or empty string if none exist.
     */
    function __construct($settings='')
    {
        $this->settings = $settings;
    }


    /**
     * Method for template_post_parse hook
     *
     * @param   string  Parsed template string
     * @param   bool    Whether an embed or not
     * @param   integer Site ID
     * @param   array   Current Template Info
     * @return  string  Template string
     */
    public function template_post_parse($final_template, $is_partial, $site_id, $currentTemplateInfo = array())
    {
        // if there are other extensions on this hook, get the output after their processing
        if (isset(ee()->extensions->last_call) && ee()->extensions->last_call) {
            $final_template = ee()->extensions->last_call;
        }

        // is this the final template?
        if ($is_partial === false) {
            if ((REQ == 'PAGE' || REQ == 'ACTION') && ee()->TMPL->template_type == 'webpage' && ee()->input->is_ajax_request() === false && !empty($currentTemplateInfo)) {
                if ((ee()->session->userdata('group_id') == 1 || ee()->session->userdata('can_debug') == 'y') && ee()->config->item('show_profiler') === 'y') {
                    $output = '<style>'.ee()->load->view('debug.css', array(), TRUE).'</style>';
                    $output .= '<script>'.ee()->load->view('debug.js', array(), TRUE).'</script>';
                    if (strpos($final_template, '</body>') !== false) {
                        $final_template = str_replace('</body>', $output.'</body>', $final_template);
                    } else {
                        $final_template .= $output;
                    }
                }
            }
        }
        return $final_template;
    }

    /**
     * Method for cp_css_end hook
     *
     * @param   void
     * @return  string  css
     */
    function cp_css_end() 
    {
        $data = ee()->extensions->last_call !== false ? ee()->extensions->last_call : '';
        $out = ee()->load->view('debug.css', array(), TRUE);

        return $data . $out;
    }

    /**
     * Method for cp_js_end hook
     *
     * @param   void
     * @return  string  javascript
     */
    function cp_js_end() 
    {
        $data = ee()->extensions->last_call !== false ? ee()->extensions->last_call : '';
        $out = ee()->load->view('debug.js', array(), TRUE);

        return $data . $out;
    }

    /**
     * Activate Extension
     *
     * This function enters the extension into the exp_extensions table
     *
     *
     * @return void
     */
    function activate_extension()
    {
        $hooks = array(
            'cp_css_end' => 'cp_css_end', 
            'cp_js_end' => 'cp_js_end', 
            'template_post_parse' => 'template_post_parse',
        );

        foreach ($hooks as $hook => $method) {
            $data = array(
                'class'     => __CLASS__,
                'method'    => $method,
                'hook'      => $hook,
                'settings'  => serialize($this->settings),
                'priority'  => ($hook == 'template_post_parse' ? 999 : 10),
                'version'   => $this->version,
                'enabled'   => 'y'
            );

            ee()->db->insert('extensions', $data);
        }
    }


    /**
     * Update Extension
     *
     * This function performs any necessary db updates when the extension
     * page is visited
     *
     * @return  mixed   void on update / false if none
     */
    function update_extension($current = '')
    {
        if ($current == '' OR $current == $this->version) {
            return FALSE;
        }

        if ($current < '1.0') {
            // Update to version 1.0
        }

        ee()->db->where('class', __CLASS__);
        ee()->db->update(
                    'extensions',
                    array('version' => $this->version)
        );
    }

    /**
     * Disable Extension
     *
     * This method removes information from the exp_extensions table
     *
     * @return void
     */
    function disable_extension()
    {
        ee()->db->where('class', __CLASS__);
        ee()->db->delete('extensions');
    }

}
// END CLASS
