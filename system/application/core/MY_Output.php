<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * IOPN: marks responses that are safe for the Apache server cache.
 *
 * The Apache config (private UIUCLibrary/iopn-scalar-ops repo) only caches responses
 * carrying "X-Scalar-Cacheable: 1", so anything not positively marked here is never
 * cached. A response is marked only if it is a complete, non-error render for an
 * anonymous visitor. Responses that bypass CI's Output class (echo/exit, errors) are
 * never marked.
 */
class MY_Output extends CI_Output {

	const CACHEABLE_HEADER = 'X-Scalar-Cacheable';
	const MIN_CACHEABLE_BYTES = 256;

	function _display($output = '')
	{
		if (!headers_sent()) {
			header_remove(self::CACHEABLE_HEADER);
			if ($this->is_cacheable(('' == $output) ? $this->final_output : $output)) {
				header(self::CACHEABLE_HEADER.': 1');
			}
		}
		return parent::_display($output);
	}

	protected function is_cacheable($body)
	{
		if (!class_exists('CI_Controller')) return false;
		$CI =& get_instance();
		if (!isset($CI->data) || !is_array($CI->data) || !isset($CI->data['login']) || !is_object($CI->data['login'])) return false;
		if (!isset($CI->data['login']->is_logged_in) || false !== $CI->data['login']->is_logged_in) return false;

		if (200 !== http_response_code()) return false;

		$body = trim((string) $body);
		if (strlen($body) < self::MIN_CACHEABLE_BYTES) return false;
		foreach (array('A PHP Error was encountered', 'A Database Error Occurred', 'An Error Was Encountered', '<b>Fatal error</b>', '<b>Warning</b>:', 'Uncaught Exception') as $error) {
			if (false !== strpos($body, $error)) return false;
		}

		$type = strtolower($this->response_content_type());
		$first = $body[0];
		$last = substr($body, -1);
		if ('' === $type || false !== strpos($type, 'text/html')) {
			return (false !== stripos($body, '<body') && 0 === strcasecmp(substr($body, -7), '</html>'));
		}
		if (false !== strpos($type, 'json')) {
			return (('{' == $first && '}' == $last) || ('[' == $first && ']' == $last));
		}
		if (false !== strpos($type, 'xml')) {
			return ('<' == $first && '>' == $last);
		}
		return false;
	}

	protected function response_content_type()
	{
		$type = '';
		foreach (headers_list() as $header) {
			if (0 === stripos($header, 'Content-Type:')) $type = trim(substr($header, 13));
		}
		foreach ($this->headers as $header) {
			if (0 === stripos($header[0], 'Content-Type:')) $type = trim(substr($header[0], 13));
		}
		return $type;
	}

}
