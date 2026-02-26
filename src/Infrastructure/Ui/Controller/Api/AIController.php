<?php

namespace App\Infrastructure\Ui\Controller\Api;

use App\Application\AI\Query\ChatWithAI\ChatWithAIQuery;
use App\Infrastructure\AI\AIService;
use Fusonic\HttpKernelBundle\Attribute\FromRequest;
use App\Infrastructure\Trait\CommandQueryTrait;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\RateLimiter\RateLimiterFactory;

class AIController extends AbstractController
{
    use CommandQueryTrait;

    public function __construct(
        protected AIService $AIService,
        #[Autowire(service: 'limiter.ai_public')]
        private readonly RateLimiterFactory $aiLimiter,
    ) {
    }

    #[Route('/ai', name: 'app_ai_index', methods: ['GET'])]
    public function index(): Response
    {
        dd('Тут будет ответ от AI, когда AI будет бесплатным');
        dd($this->AIService->submit('Привет!'));
    }

    #[Route('/api/ai', name: 'app_ai_api', methods: ['POST'])]
    public function chat(Request $request, #[FromRequest] ChatWithAIQuery $query): JsonResponse
    {
        $identity = $this->getUser()?->getUserIdentifier() ?? ($request->getClientIp() ?? 'anonymous');
        $limit = $this->aiLimiter->create('ai:' . $identity)->consume(1);

        if (!$limit->isAccepted()) {
            $retryAfter = $limit->getRetryAfter();
            $headers = [];
            if ($retryAfter !== null) {
                $headers['Retry-After'] = (string) max(1, $retryAfter->getTimestamp() - time());
            }

            return $this->json([
                'error' => 'Too many AI requests. Please retry later.',
            ], Response::HTTP_TOO_MANY_REQUESTS, $headers);
        }

        if (!$this->passesAntiBotChecks($request)) {
            return $this->json([
                'error' => 'Request blocked by anti-bot protection.',
            ], Response::HTTP_FORBIDDEN);
        }

        $user = $this->getUser();
        if ($user) {
            $query->userId = $user->getId();
        }

        $result = $this->query($query);

        return $this->json($result);
    }

    private function passesAntiBotChecks(Request $request): bool
    {
        $userAgent = strtolower((string) $request->headers->get('User-Agent', ''));
        if ($userAgent === '') {
            return false;
        }

        $blockedUserAgentMarkers = ['bot', 'crawler', 'spider', 'wget', 'python-requests'];
        foreach ($blockedUserAgentMarkers as $marker) {
            if (str_contains($userAgent, $marker)) {
                return false;
            }
        }

        $origin = $request->headers->get('Origin');
        if (is_string($origin) && $origin !== '') {
            $originHost = parse_url($origin, PHP_URL_HOST);
            if (is_string($originHost) && $originHost !== '' && $originHost !== $request->getHost()) {
                return false;
            }
        }

        $payload = json_decode($request->getContent(), true);
        if (is_array($payload) && isset($payload['website']) && trim((string) $payload['website']) !== '') {
            return false;
        }

        return true;
    }
}