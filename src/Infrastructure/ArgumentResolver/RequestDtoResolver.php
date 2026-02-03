<?php

namespace App\Infrastructure\ArgumentResolver;

use App\Infrastructure\Attribute\FromRequest;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Controller\ValueResolverInterface;
use Symfony\Component\HttpKernel\ControllerMetadata\ArgumentMetadata;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class RequestDtoResolver implements ValueResolverInterface
{
    public function __construct(
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {
    }

    public function resolve(Request $request, ArgumentMetadata $argument): iterable
    {
        // Проверяем наличие атрибута #[FromRequest] на параметре метода
        $attributes = $argument->getAttributesOfType(FromRequest::class, ArgumentMetadata::IS_INSTANCEOF);
        
        if (empty($attributes)) {
            return [];
        }

        $type = $argument->getType();
        if (!$type || !class_exists($type)) {
            return [];
        }

        $reflection = new \ReflectionClass($type);

        // Собираем данные из разных источников
        $data = [];
        
        // 1. Route параметры (например {shopId}, {id})
        $routeParams = $request->attributes->get('_route_params', []);
        $data = array_merge($data, $routeParams);
        
        // 2. Query параметры (?type=shelf)
        $data = array_merge($data, $request->query->all());
        
        // 3. JSON body
        $content = $request->getContent();
        if (!empty($content)) {
            $jsonData = json_decode($content, true);
            if (is_array($jsonData)) {
                $data = array_merge($data, $jsonData);
            }
        }

        // Создаем DTO через конструктор
        $dto = $this->createDtoFromData($reflection, $data);

        // Валидация
        $errors = $this->validator->validate($dto);

        if (count($errors) > 0) {
            $messages = [];
            foreach ($errors as $error) {
                $messages[$error->getPropertyPath()] = $error->getMessage();
            }
            
            throw new BadRequestHttpException(json_encode([
                'error' => 'Validation failed',
                'violations' => $messages
            ]));
        }

        yield $dto;
    }

    private function createDtoFromData(\ReflectionClass $reflection, array $data): object
    {
        $constructor = $reflection->getConstructor();
        
        if (!$constructor) {
            // Нет конструктора - создаем пустой объект
            return $reflection->newInstance();
        }

        $args = [];
        foreach ($constructor->getParameters() as $param) {
            $paramName = $param->getName();
            $paramType = $param->getType();
            
            // Проверяем наличие значения в данных
            if (array_key_exists($paramName, $data)) {
                $value = $data[$paramName];
                
                // Приводим к нужному типу
                if ($paramType && $paramType instanceof \ReflectionNamedType) {
                    $value = $this->castToType($value, $paramType);
                }
                
                $args[] = $value;
            } elseif ($param->isDefaultValueAvailable()) {
                // Используем значение по умолчанию
                $args[] = $param->getDefaultValue();
            } elseif ($param->allowsNull()) {
                // Nullable параметр без значения
                $args[] = null;
            } else {
                // Обязательный параметр без значения
                throw new \InvalidArgumentException(
                    sprintf('Missing required parameter "%s" for %s', $paramName, $reflection->getName())
                );
            }
        }

        return $reflection->newInstanceArgs($args);
    }

    private function castToType(mixed $value, \ReflectionNamedType $type): mixed
    {
        if ($type->isBuiltin()) {
            return match($type->getName()) {
                'int' => (int) $value,
                'float' => (float) $value,
                'bool' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
                'string' => (string) $value,
                'array' => (array) $value,
                default => $value
            };
        }
        
        return $value;
    }
}
