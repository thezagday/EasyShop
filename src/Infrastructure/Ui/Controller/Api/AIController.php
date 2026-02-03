<?php

namespace App\Infrastructure\Ui\Controller\Api;

use App\Application\AI\Query\ChatWithAI\ChatWithAIQuery;
use App\Infrastructure\AI\AIService;
use App\Infrastructure\Attribute\FromRequest;
use App\Infrastructure\Trait\CommandQueryTrait;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class AIController extends AbstractController
{
    use CommandQueryTrait;

    public function __construct(
        protected AIService $AIService,
    ) {
    }

    #[Route('/ai', name: 'app_ai_index', methods: ['GET'])]
    public function index(): Response
    {
        dd('Тут будет ответ от AI, когда AI будет бесплатным');
        dd($this->AIService->submit('Привет!'));
    }

    #[Route('/api/ai', name: 'app_ai_api', methods: ['POST'])]
    public function chat(#[FromRequest] ChatWithAIQuery $query): JsonResponse
    {
        $result = $this->query($query);

        return $this->json($result);
    }
}