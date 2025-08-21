<?php

namespace App\Services;

use Symfony\AI\Agent\AgentInterface;
use Symfony\AI\Platform\Message\Message;
use Symfony\AI\Platform\Message\MessageBag;
use Symfony\AI\Platform\Result\ResultInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

final readonly class AIService
{
    public function __construct(
        #[Autowire(service: 'ai.agent.default')]
        private AgentInterface $agent,
    ) {
    }

    public function submit(string $message): ResultInterface
    {
        $messages = new MessageBag(
            Message::ofUser($message),
        );

        return $this->agent->call($messages);
    }
}
