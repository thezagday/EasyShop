<?php

namespace App\Infrastructure\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class LocaleSubscriber implements EventSubscriberInterface
{
    private string $defaultLocale;
    private const LOCALE_COOKIE_NAME = '_locale';

    public function __construct(string $defaultLocale = 'pl')
    {
        $this->defaultLocale = $defaultLocale;
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();

        if ($locale = $request->query->get('_locale')) {
            if ($this->isAllowedLocale((string) $locale)) {
                $request->attributes->set('_locale', $locale);
                $request->setLocale($locale);
                if ($request->hasSession()) {
                    $request->getSession()->set('_locale', $locale);
                }
            }

            return;
        }

        $locale = null;
        $cookieLocale = $request->cookies->get(self::LOCALE_COOKIE_NAME);
        if (\is_string($cookieLocale) && $cookieLocale !== '') {
            $locale = $cookieLocale;
        }

        if ($locale === null && $request->hasSession()) {
            $sessionLocale = $request->getSession()->get('_locale');
            if (\is_string($sessionLocale) && $sessionLocale !== '') {
                $locale = $sessionLocale;
            }
        }

        if ($locale === null) {
            $locale = $this->defaultLocale;
        }

        if (!$this->isAllowedLocale((string) $locale)) {
            $locale = $this->defaultLocale;
        }

        if ($request->hasSession()) {
            $request->getSession()->set('_locale', $locale);
        }

        $request->attributes->set('_locale', $locale);
        $request->setLocale($locale);
    }

    private function isAllowedLocale(string $locale): bool
    {
        return \in_array($locale, ['pl', 'en'], true);
    }

    public static function getSubscribedEvents(): array
    {
        return [
            // must be registered before (default) LocaleListener
            KernelEvents::REQUEST => [['onKernelRequest', 20]],
        ];
    }
}
