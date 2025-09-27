<?php
// Simple test to check if .htaccess redirects work
// Upload this file and visit: yoursite.com/test-redirect.php

echo "<h2>Redirect Test</h2>";
echo "<p>If you can see this page, .htaccess is working on your server.</p>";

// Test some of the old URLs
$testUrls = [
    'index.php?f=bemutatkozas',
    'index.php?f=tevekenysegeink', 
    'index.php?f=elerhetoseg',
    'index.php?f=arak',
    'index.php?f=activities',
    'index.php?f=colleagues',
    'index.php?f=references',
    'index.php?f=munkatarsaink_benko_istvan',
    'index.php?f=referenciak_kozbeszerzes',
    'index.php?f=Envecon',
    'index.php?f=letoltes_acs',
    'index.php?f=Answer'
];

echo "<h3>Test these old URLs:</h3>";
echo "<ul>";
foreach($testUrls as $url) {
    echo "<li><a href='$url' target='_blank'>$url</a></li>";
}
echo "</ul>";

echo "<p>Each link should redirect to the new page structure.</p>";
?>
