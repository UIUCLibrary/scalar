<?php
// IOPN site settings, applied after local_settings.php's own values. Secrets go in /etc/scalar/local_settings.php instead.

$config['email_replyto_address'] = 'iopn-admin@library.illinois.edu';
$config['email_replyto_name'] = 'IOPN Admin';

// Link external pages directly rather than rendering them inside Scalar's external.php
$config['external_direct_hyperlink'] = true;

// Kaltura MediaSpace players keep the permissions they had when this was hard-coded; every other embedded page gets fullscreen only
$config['iframe_permissions'] = array(
  '*' => 'fullscreen',
  'mediaspace.illinois.edu' => 'fullscreen; autoplay; encrypted-media; picture-in-picture; clipboard-write',
);
