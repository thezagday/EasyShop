<?php

namespace App\Infrastructure\AI;

use Psr\Log\LoggerInterface;
use Symfony\AI\Agent\AgentInterface;
use Symfony\AI\Platform\Message\Message;
use Symfony\AI\Platform\Message\MessageBag;
use Symfony\AI\Platform\Result\ResultInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

final readonly class AIService
{
    public function __construct(
        #[Autowire(service: 'ai.agent.default')]
        private AgentInterface $primaryAgent,
        #[Autowire(service: 'ai.agent.openai_fallback')]
        private AgentInterface $fallbackAgent,
        private LoggerInterface $logger,
    ) {
    }

    public function submit(string $message): ResultInterface
    {
        $messages = new MessageBag(
            Message::ofUser($message),
        );

        try {
            return $this->primaryAgent->call($messages);
        } catch (\Throwable $e) {
            $this->logger->warning('Primary AI agent (OpenRouter) failed, falling back to OpenAI', [
                'error' => $e->getMessage(),
                'message' => $message,
            ]);
            
            return $this->fallbackAgent->call($messages);
        }
    }
}
