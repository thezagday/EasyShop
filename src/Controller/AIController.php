<?php

namespace App\Controller;

use App\Services\AIService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class AIController extends AbstractController
{
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
    public function chat(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $question = $data['message'] ?? '';

        $answer = $this->AIService->submit($question);

        return $this->json([
            'answer' => $answer->getContent(),
        ]);
    }
}