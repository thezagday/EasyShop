<?php

declare(strict_types=1);

namespace App\Infrastructure\Ui\Controller\Admin;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('ROLE_ADMIN')]
final class AdminSetLocaleController extends AbstractController
{
    private const ALLOWED = ['pl', 'en'];

    #[Route('/admin/locale/{locale}', name: 'admin_set_locale', requirements: ['locale' => 'pl|en'], methods: ['GET'])]
    public function __invoke(string $locale, Request $request): RedirectResponse
    {
        if (!\in_array($locale, self::ALLOWED, true)) {
            throw new BadRequestHttpException();
        }

        $redirectTarget = $this->appendLocaleQueryParam(
            $this->resolveSafeRedirectTarget($request),
            $locale
        );

        $response = new RedirectResponse($redirectTarget);

        $cookie = Cookie::create(
            '_locale',
            $locale,
            new \DateTimeImmutable('+1 year'),
            '/',
            null,
            $request->isSecure(),
            false,
            false,
            Cookie::SAMESITE_LAX
        );

        $response->headers->setCookie($cookie);

        if ($request->hasSession()) {
            $request->getSession()->set('_locale', $locale);
        }

        return $response;
    }

    private function resolveSafeRedirectTarget(Request $request): string
    {
        $default = $this->generateUrl('admin');

        $candidate = $request->query->getString('redirect');
        if ($candidate !== '') {
            $safe = $this->normalizeSafeRedirectTarget($candidate, $request);
            if ($safe !== null) {
                return $safe;
            }
        }

        $referer = (string) $request->headers->get('Referer', '');
        if ($referer === '') {
            return $default;
        }

        $safe = $this->normalizeSafeRedirectTarget($referer, $request);

        return $safe ?? $default;
    }

    private function normalizeSafeRedirectTarget(string $target, Request $request): ?string
    {
        $parts = parse_url($target);
        if (!\is_array($parts)) {
            return null;
        }

        $path = (string) ($parts['path'] ?? '');
        if ($path === '' || str_starts_with($path, '/admin/locale/')) {
            return null;
        }

        if (isset($parts['host'])) {
            $scheme = (string) ($parts['scheme'] ?? $request->getScheme());
            $host = (string) $parts['host'];
            if ($host !== $request->getHost() || $scheme !== $request->getScheme()) {
                return null;
            }

            return $target;
        }

        if (!str_starts_with($path, '/')) {
            return null;
        }

        $query = isset($parts['query']) ? '?' . $parts['query'] : '';
        $fragment = isset($parts['fragment']) ? '#' . $parts['fragment'] : '';

        return $path . $query . $fragment;
    }

    private function appendLocaleQueryParam(string $target, string $locale): string
    {
        $parts = parse_url($target);
        if (!\is_array($parts)) {
            return $target;
        }

        $queryParams = [];
        if (isset($parts['query'])) {
            parse_str((string) $parts['query'], $queryParams);
        }
        $queryParams['_locale'] = $locale;
        $query = http_build_query($queryParams);

        $path = (string) ($parts['path'] ?? '/admin');
        $fragment = isset($parts['fragment']) ? '#' . $parts['fragment'] : '';

        if (isset($parts['host'])) {
            $scheme = (string) ($parts['scheme'] ?? 'http');
            $host = (string) $parts['host'];
            $port = isset($parts['port']) ? ':' . $parts['port'] : '';

            return sprintf('%s://%s%s%s?%s%s', $scheme, $host, $port, $path, $query, $fragment);
        }

        return $path . '?' . $query . $fragment;
    }

}
