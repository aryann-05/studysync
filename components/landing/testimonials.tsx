"use client";

import { Star, Quote } from "lucide-react";
import { TESTIMONIALS } from "@/lib/constants";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Testimonials() {
  return (
    <section className="border-y bg-muted/30 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Testimonials
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by students everywhere
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Don't take our word for it — hear from our users.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((testimonial) => (
            <figure
              key={testimonial.name}
              className="flex flex-col rounded-xl border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <Quote className="h-6 w-6 text-primary/30" aria-hidden />
              <div className="mt-3 flex gap-0.5" aria-label={`${testimonial.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < testimonial.rating
                        ? "fill-warning text-warning"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                "{testimonial.content}"
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t pt-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-xs text-white">
                    {testimonial.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

