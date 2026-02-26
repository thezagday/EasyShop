<?php

namespace App\Infrastructure\Ui\Controller\Api;

use ReflectionAttribute;
use ReflectionClass;
use ReflectionException;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class ApiDocsController extends AbstractController
{
    public function __construct(
        #[Autowire('%kernel.environment%')]
        private readonly string $appEnv,
    ) {
    }

    /**
     * Mutating public API routes that are intentionally available for guest product flows.
     * This list is used for docs highlighting only and does not enforce security.
     *
     * @var list<array{pattern: string, methods: list<string>}>
     */
    private const EXPECTED_PUBLIC_MUTATING_ROUTES = [
        ['pattern' => '#^/api/track$#', 'methods' => ['POST']],
        ['pattern' => '#^/api/track/[^/]+/route$#', 'methods' => ['PATCH']],
        ['pattern' => '#^/api/ai$#', 'methods' => ['POST']],
    ];

    /**
     * @var list<string>
     */
    private const SENSITIVE_API_PREFIXES = [
        '/api/user',
        '/api/admin',
        '/api/internal',
        '/api/profile',
    ];

    #[Route('/api/docs/all', name: 'api_docs_all', methods: ['GET'])]
    public function listAll(RouterInterface $router): JsonResponse
    {
        $this->ensureDocsAccess();

        $endpoints = $this->collectEndpoints($router);

        $response = new JsonResponse([
            'generatedAt' => (new \DateTimeImmutable())->format(DATE_ATOM),
            'total' => count($endpoints),
            'endpoints' => $endpoints,
        ]);

        $response->setEncodingOptions(
            $response->getEncodingOptions() | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES
        );

        return $response;
    }

    #[Route('/api/docs/all/ui', name: 'api_docs_all_ui', methods: ['GET'])]
    public function listAllUi(RouterInterface $router): Response
    {
        $this->ensureDocsAccess();

        $endpoints = $this->collectEndpoints($router);

        $methodOptions = [];
        foreach ($endpoints as $endpoint) {
            foreach ($endpoint['methods'] as $method) {
                $methodOptions[$method] = true;
            }
        }

        $securityRules = [];
        foreach ($endpoints as $endpoint) {
            foreach ($endpoint['isGranted'] as $rule) {
                $securityRules[$rule] = true;
            }
        }

        ksort($methodOptions);
        ksort($securityRules);

        return $this->render('api/docs_all_ui.html.twig', [
            'generatedAt' => (new \DateTimeImmutable())->format(DATE_ATOM),
            'total' => count($endpoints),
            'endpoints' => $endpoints,
            'methodOptions' => array_keys($methodOptions),
            'securityRules' => array_keys($securityRules),
        ]);
    }

    /**
     * @return list<array{name: string, path: string, methods: list<string>, source: string, controller: ?string, isGranted: list<string>, protectionStatus: string, protectionLabel: string, protectionReason: string}>
     */
    private function collectEndpoints(RouterInterface $router): array
    {
        $endpoints = [];

        foreach ($router->getRouteCollection() as $name => $route) {
            $path = $route->getPath();

            if (!str_starts_with($path, '/api')) {
                continue;
            }

            $methods = $route->getMethods();
            if ($methods === []) {
                $methods = ['ANY'];
            }

            $controller = $route->getDefault('_controller');
            $isApiPlatform = $route->getDefault('_api_resource_class') !== null || str_starts_with($name, '_api_');
            $isGranted = $this->extractIsGrantedRules($controller);
            $protection = $this->classifyProtection($path, $methods, $isGranted);

            $endpoints[] = [
                'name' => $name,
                'path' => $path,
                'methods' => $methods,
                'source' => $isApiPlatform ? 'api_platform' : 'custom_controller',
                'controller' => is_string($controller) ? $controller : null,
                'isGranted' => $isGranted,
                'protectionStatus' => $protection['status'],
                'protectionLabel' => $protection['label'],
                'protectionReason' => $protection['reason'],
            ];
        }

        usort($endpoints, static function (array $left, array $right): int {
            $pathCompare = strcmp($left['path'], $right['path']);
            if ($pathCompare !== 0) {
                return $pathCompare;
            }

            return strcmp(implode(',', $left['methods']), implode(',', $right['methods']));
        });

        return $endpoints;
    }

    /**
     * @param list<string> $methods
     * @param list<string> $isGranted
     *
     * @return array{status: string, label: string, reason: string}
     */
    private function classifyProtection(string $path, array $methods, array $isGranted): array
    {
        if ($this->isUnifiedDocsRoute($path)) {
            if ($this->appEnv === 'prod') {
                return [
                    'status' => 'protected',
                    'label' => 'Protected',
                    'reason' => 'Unified docs are restricted to ROLE_ADMIN in production.',
                ];
            }

            return [
                'status' => 'public_expected',
                'label' => 'Public (Expected)',
                'reason' => 'Unified docs are intentionally public in non-production environments.',
            ];
        }

        if ($isGranted !== []) {
            return [
                'status' => 'protected',
                'label' => 'Protected',
                'reason' => 'Route has IsGranted rule(s): ' . implode(', ', $isGranted),
            ];
        }

        if ($this->isSensitivePath($path)) {
            return [
                'status' => 'review',
                'label' => 'Unprotected (Review)',
                'reason' => 'Sensitive API prefix without explicit IsGranted.',
            ];
        }

        if ($this->isExpectedPublicRoute($path, $methods)) {
            return [
                'status' => 'public_expected',
                'label' => 'Public (Expected)',
                'reason' => 'Expected guest/product endpoint.',
            ];
        }

        if ($this->isReadOnlyMethods($methods)) {
            return [
                'status' => 'public_expected',
                'label' => 'Public (Read-only)',
                'reason' => 'Read-only endpoint without explicit IsGranted.',
            ];
        }

        return [
            'status' => 'review',
            'label' => 'Unprotected (Review)',
            'reason' => 'Mutating endpoint without IsGranted and not in expected-public list.',
        ];
    }

    private function isSensitivePath(string $path): bool
    {
        foreach (self::SENSITIVE_API_PREFIXES as $prefix) {
            if (str_starts_with($path, $prefix)) {
                return true;
            }
        }

        return false;
    }

    private function isUnifiedDocsRoute(string $path): bool
    {
        return str_starts_with($path, '/api/docs/all');
    }

    private function ensureDocsAccess(): void
    {
        if ($this->appEnv !== 'prod') {
            return;
        }

        if (!$this->isGranted('ROLE_ADMIN')) {
            throw $this->createAccessDeniedException('Unified API docs are available for admins only in production.');
        }
    }

    /**
     * @param list<string> $methods
     */
    private function isExpectedPublicRoute(string $path, array $methods): bool
    {
        foreach (self::EXPECTED_PUBLIC_MUTATING_ROUTES as $rule) {
            if (!preg_match($rule['pattern'], $path)) {
                continue;
            }

            if ($this->methodsAreSubsetOf($methods, $rule['methods'])) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param list<string> $methods
     * @param list<string> $allowed
     */
    private function methodsAreSubsetOf(array $methods, array $allowed): bool
    {
        foreach ($methods as $method) {
            if ($method === 'HEAD' || $method === 'OPTIONS') {
                continue;
            }

            if (!in_array($method, $allowed, true)) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param list<string> $methods
     */
    private function isReadOnlyMethods(array $methods): bool
    {
        return $this->methodsAreSubsetOf($methods, ['GET']);
    }

    /**
     * @return list<string>
     */
    private function extractIsGrantedRules(mixed $controller): array
    {
        if (!is_string($controller) || !str_contains($controller, '::')) {
            return [];
        }

        [$class, $method] = explode('::', $controller, 2);

        if (!class_exists($class) || !method_exists($class, $method)) {
            return [];
        }

        try {
            $reflectionClass = new ReflectionClass($class);
            $reflectionMethod = $reflectionClass->getMethod($method);
        } catch (ReflectionException) {
            return [];
        }

        $classRules = $this->readIsGrantedAttributes($reflectionClass->getAttributes(IsGranted::class));
        $methodRules = $this->readIsGrantedAttributes($reflectionMethod->getAttributes(IsGranted::class));

        return array_values(array_unique([...$classRules, ...$methodRules]));
    }

    /**
     * @param list<ReflectionAttribute<IsGranted>> $attributes
     *
     * @return list<string>
     */
    private function readIsGrantedAttributes(array $attributes): array
    {
        $rules = [];

        foreach ($attributes as $attribute) {
            $arguments = $attribute->getArguments();
            $value = $arguments['attribute'] ?? $arguments[0] ?? 'IS_GRANTED';

            if (is_scalar($value)) {
                $rules[] = (string) $value;
                continue;
            }

            if (is_object($value)) {
                $rules[] = $value::class;
                continue;
            }

            $rules[] = 'IS_GRANTED';
        }

        return $rules;
    }
}
